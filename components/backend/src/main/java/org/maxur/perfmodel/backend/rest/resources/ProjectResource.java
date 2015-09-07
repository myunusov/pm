package org.maxur.perfmodel.backend.rest.resources;


import org.jsondoc.core.annotation.*;
import org.jsondoc.core.pojo.ApiVerb;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.domain.ValidationException;
import org.maxur.perfmodel.backend.rest.dto.ProjectDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.Optional;

import static java.lang.String.format;
import static java.util.stream.Collectors.toList;
import static org.maxur.perfmodel.backend.rest.WebException.*;
import static org.maxur.perfmodel.backend.rest.dto.ProjectDto.dto;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:project}")
@Api(name = "Project Resource", description = "Methods for managing Project")
@ApiVersion(since = "1.0")
public class ProjectResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    private static final String ID = "id";

    private static final String PERFORMANCE_MODEL_IS_NOT_FOUNDED = "Performance Model '%s' is not founded";

    private static final String PERFORMANCE_MODEL_IS_NOT_SAVED = "Performance Model is not saved";

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
    public @ApiResponseObject
    Collection<ProjectDto> findAll() {
        return repository.findAll().stream().map(ProjectDto::dto).collect(toList());
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
            @PathParam(ID) String id
    ) {
        final Optional<Project> result = repository.get(id);
        if (result.isPresent()) {
            return dto(result.get());
        }
        LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
        throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
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
            @PathParam(ID) String id
    ) {
        final Project project = repository.remove(id);
        if (project == null) {
            LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
            throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
        }
        return dto(project);
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
    public synchronized @ApiResponseObject Response save(
            @ApiBodyObject final ProjectDto dto
    ) {
        try {
            final Project project = dto.assemble();
            final Project result = project.saveWith(repository);
            return Response.status(Response.Status.CREATED).entity(dto(result)).build();
        } catch (NumberFormatException e) {
            LOGGER.error(PERFORMANCE_MODEL_IS_NOT_SAVED, e);
            throw badRequestException(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
        } catch (ValidationException e) {
            LOGGER.error(PERFORMANCE_MODEL_IS_NOT_SAVED, e);
            throw conflictException(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
        }
    }

}
