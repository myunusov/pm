package org.maxur.perfmodel.backend.rest;


import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.ProjectRepository;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.domain.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import static java.lang.String.format;
import static org.maxur.perfmodel.backend.rest.WebException.badRequestException;
import static org.maxur.perfmodel.backend.rest.WebException.conflictException;
import static org.maxur.perfmodel.backend.rest.WebException.notFoundException;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:projects}")
public class ProjectResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    private static final String NAME = "name";

    private static final String VERSION = "version";

    private static final String ID = "id";

    private static final String PERFORMANCE_MODEL_IS_NOT_FOUNDED = "Performance Model '%s' is not founded";

    private static final String PERFORMANCE_MODEL_IS_NOT_SAVED = "Performance Model is not saved";

    @Inject
    private ProjectRepository repository;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Collection<Project> findAll() {
        return repository.findAll();
    }

    @GET
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam(NAME) String name) {
        final Project project = repository.get(name);
        if (project == null) {
            LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, name));
            throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, name));
        }
        return project.asRaw();
    }

    @DELETE
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public Project delete(@PathParam(NAME) String name) {
        final Project project = repository.remove(name);
        if (project == null) {
            LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, name));
            throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, name));
        }
        return  project;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response save(final String object) {
        try {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Map<String,Object> map = mapper.readValue(object, new TypeReference<HashMap<String,Object>>(){});

            final String id = (String) map.get(ID);
            final String name = (String) map.get(NAME);
            final Integer version = (Integer) map.get(VERSION);
            final Project previousProjectVersion = repository.get(name);
            final Project project;
            if (previousProjectVersion != null) {
                project = new Project(id, name, version + 1);
                project.checkConflictWith(previousProjectVersion);
            } else {
                project = new Project(id, name, 1);
            }
            map.put(VERSION, project.getVersion());
            project.setRaw(mapper.writeValueAsString(map));
            repository.put(project);
            return Response.status(Response.Status.CREATED).entity(project).build();
        } catch (ValidationException e) {
            LOGGER.info(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
            throw conflictException(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
        } catch (IOException | NumberFormatException e) {
            LOGGER.error(PERFORMANCE_MODEL_IS_NOT_SAVED, e);
            throw badRequestException(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
        }
    }


}
