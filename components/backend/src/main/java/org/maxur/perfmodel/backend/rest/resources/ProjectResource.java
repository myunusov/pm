package org.maxur.perfmodel.backend.rest.resources;


import org.jsondoc.core.annotation.*;
import org.jsondoc.core.pojo.ApiVerb;
import org.maxur.perfmodel.backend.domain.ConflictException;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.rest.dto.ProjectDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.Optional;

import static com.google.common.base.Strings.isNullOrEmpty;
import static java.lang.String.format;
import static org.maxur.perfmodel.backend.rest.WebException.*;
import static org.maxur.perfmodel.backend.rest.dto.ProjectDto.dto;
import static org.maxur.perfmodel.backend.rest.dto.ProjectDto.dtoList;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:project}")
@Api(name = "Project Resource", description = "Methods for managing Project")
@ApiVersion(since = "1.0")
public class ProjectResource {

    private static final String PROJECT_IS_NOT_SAVED = "Project is not saved";

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    @Inject
    private Repository<Project> repository;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
            path = "/project",
            verb = ApiVerb.GET,
            description = "Gets all projects",
            produces = { MediaType.APPLICATION_JSON },
            responsestatuscode = "200 - OK"
    )
    public @ApiResponseObject Collection<ProjectDto> findAll() {
        return dtoList(repository.findAll());
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
            path = "/project/{id}",
            verb = ApiVerb.GET,
            description = "Get the project by it's identifier",
            produces = { MediaType.APPLICATION_JSON },
            responsestatuscode = "200 - OK"
    )
    @ApiErrors(apierrors={
            @ApiError(code="404", description="Project not found"),
            @ApiError(code="400", description="Bad request")
    })
    public @ApiResponseObject ProjectDto load(
            @ApiPathParam(name = "id", description = "The project identifier")
            @PathParam("id") String id
    ) {
        checkIdIsNotNull(id);
        final Optional<Project> result = repository.get(id);
        checkResult(id, result);
        return dto(result.get());
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
            path = "/project/{id}",
            verb = ApiVerb.DELETE,
            description = "Delete the project by it's identifier",
            produces = { MediaType.APPLICATION_JSON },
            responsestatuscode = "200 - OK"
    )
    @ApiErrors(apierrors={
            @ApiError(code="404", description="Project not found"),
            @ApiError(code="400", description="Bad request")
    })
    public @ApiResponseObject ProjectDto delete(
            @ApiPathParam(name = "id", description = "The project identifier")
            @PathParam("id") String id
    ) {
        checkIdIsNotNull(id);
        final Optional<Project> result = repository.remove(id);
        checkResult(id, result);
        return dto(result.get());
    }

    @POST
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
            path = "/project/{id}",
            verb = ApiVerb.POST,
            description = "Create new project version by project's identifier",
            produces = { MediaType.APPLICATION_JSON },
            consumes = { MediaType.APPLICATION_JSON },
            responsestatuscode = "201 - OK"
    )
    @ApiErrors(apierrors={
            @ApiError(code="404", description="Project not found"),
            @ApiError(code="400", description="Bad request")
    })
    public @ApiResponseObject Response save(
            @ApiPathParam(name = "id", description = "The project identifier")
            @PathParam("id") String id,
            @ApiBodyObject final ProjectDto dto
    ) {
        try {
            checkIdIsNotNull(id);
            final Project project = dto.assemble();
            final Optional<Project> result = repository.put(project);
            return created(result.get());
        } catch (NumberFormatException e) {
            LOGGER.error(PROJECT_IS_NOT_SAVED, e);
            throw badRequestException(PROJECT_IS_NOT_SAVED, e.getMessage());
        } catch (ConflictException e) {
            LOGGER.error(PROJECT_IS_NOT_SAVED, e);
            throw conflictException(PROJECT_IS_NOT_SAVED, e.getMessage());
        }
    }

    private Response created(final Project result) {
        return Response.status(Response.Status.CREATED).entity(dto(result)).build();
    }

    private void checkIdIsNotNull(final String id) {
        if (isNullOrEmpty(id)) {
            final String msg = "Bad get request. 'Id' must not be null";
            LOGGER.error(msg);
            throw notFoundException(msg);
        }
    }

    private void checkResult(final String id, final Optional<Project> result) {
        if (!result.isPresent()) {
            final String msg = format("Project '%s' is not founded", id);
            LOGGER.error(msg);
            throw notFoundException(msg);
        }
    }

}
