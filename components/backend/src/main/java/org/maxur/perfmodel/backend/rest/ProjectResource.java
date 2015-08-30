package org.maxur.perfmodel.backend.rest;


import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
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
@Path("/{a:project}")
public class ProjectResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    private static final String ID = "id";

    private static final String PERFORMANCE_MODEL_IS_NOT_FOUNDED = "Performance Model '%s' is not founded";

    private static final String PERFORMANCE_MODEL_IS_NOT_SAVED = "Performance Model is not saved";

    @Inject
    private Repository<Project> repository;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Collection<Project> findAll() {
        return repository.findAll();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam(ID) String id) {
        final Project project = repository.get(id);
        if (project == null) {
            LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
            throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
        }
        return project.getRaw();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Project delete(@PathParam(ID) String id) {
        final Project project = repository.remove(id);
        if (project == null) {
            LOGGER.error(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
            throw notFoundException(format(PERFORMANCE_MODEL_IS_NOT_FOUNDED, id));
        }
        return  project;
    }

    @POST
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response save(final String object) {
        try {
            final ProjectDTO dto = ProjectDTO.make(object);
            checkNamesakes(dto);
            final Project oldProject = repository.get(dto.getId());
            if (oldProject != null) {
                dto.incVersion();
            } else {
                dto.resetVersion();
            }
            final Project project = dto.assemble();
            checkConflictWith(oldProject, project);
            repository.put(project);
            return Response.status(Response.Status.CREATED).entity(project).build();
        } catch (IOException | NumberFormatException e) {
            LOGGER.debug(PERFORMANCE_MODEL_IS_NOT_SAVED, e);
            LOGGER.error(PERFORMANCE_MODEL_IS_NOT_SAVED, e);
            throw badRequestException(PERFORMANCE_MODEL_IS_NOT_SAVED, e.getMessage());
        }
    }

    public void checkConflictWith(final Project oldProject, final Project newProject) {
        if (oldProject == null) {
            return;
        }
        if (!newProject.getId().equals(oldProject.getId())) {
            throw conflictException(
                    PERFORMANCE_MODEL_IS_NOT_SAVED,
                    format("Performance Model '%s' already exists.", newProject.getName())
            );
        }
        if (newProject.getVersion() - 1 != oldProject.getVersion()) {
            throw conflictException(
                    PERFORMANCE_MODEL_IS_NOT_SAVED,
                    format("Performance Model '%s' has already been changed by another user.", newProject.getName())
            );
        }
    }

    private void checkNamesakes(ProjectDTO dto) {
        final Collection<Project> namesakes = repository.findByName(dto.getName());
        if (namesakes.size() > 1) {
            LOGGER.error(PERFORMANCE_MODEL_IS_NOT_SAVED);
            throw conflictException(
                    PERFORMANCE_MODEL_IS_NOT_SAVED,
                    format("More than one object with same name='%s'", dto.getName())
            );
        }
        if (namesakes.size() == 1) {
            final Project namesake = namesakes.iterator().next();
            if (!namesake.getId().equals(dto.getId())) {
                throw conflictException(
                        PERFORMANCE_MODEL_IS_NOT_SAVED,
                        format("Performance Model '%s' already exists.", dto.getName())
                );
            }
        }
    }

    private static class ProjectDTO {

        private static final String NAME = "name";
        private static final String VERSION = "version";

        private final Map<String, Object> map;

        ProjectDTO(final Map<String, Object> map) {
            this.map = map;
        }

        static ProjectDTO make(final String raw) throws IOException {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Map<String,Object> map = mapper.readValue(raw, new TypeReference<HashMap<String,Object>>(){
            });
            return new ProjectDTO(map);
        }

        String getId() {
            return (String) map.get(ID);
        }

        String getName() {
            return (String) map.get(NAME);
        }

        Integer getVersion() {
            return (Integer) map.get(VERSION);
        }

        void incVersion() {
            map.put(VERSION, getVersion() + 1);
        }

        void resetVersion() {
            map.put(VERSION, 1);
        }

        Project assemble() throws JsonProcessingException {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Project result = new Project(getId(), getName(), getVersion());
            result.setRaw(mapper.writeValueAsString(map));
            return result;
        }
    }


}
