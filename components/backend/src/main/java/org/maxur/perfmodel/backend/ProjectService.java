package org.maxur.perfmodel.backend;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

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

import static org.maxur.perfmodel.backend.WebException.badRequestException;
import static org.maxur.perfmodel.backend.WebException.conflictException;
import static org.maxur.perfmodel.backend.WebException.notFoundException;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:projects}")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ProjectService {

    public static final String NAME = "name";

    public static final String VERSION = "version";

    public static final String ID = "id";

    private final DataSource dataSource = new MemoryDataSource();

    @GET
    public Collection<Project> findAll() {
        return dataSource.findAll();
    }

    @GET
    @Path("/{name}")
    public String load(@PathParam(NAME) String name) {
        final Project project = dataSource.get(name);
        if (project == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return project.asRaw();
    }

    @DELETE
    @Path("/{name}")
    public Project delete(@PathParam(NAME) String name) {
        final Project project = dataSource.remove(name);
        if (project == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return  project;
    }

    @POST
    public synchronized Response save(final String object) {
        try {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Map<String,Object> map = mapper.readValue(object, new TypeReference<HashMap<String,Object>>(){});

            final String id = (String) map.get(ID);
            final String name = (String) map.get(NAME);
            final Integer version = (Integer) map.get(VERSION);
            final Project previousProjectVersion = dataSource.get(name);
            final Project project;
            if (previousProjectVersion != null) {
                project = new Project(id, name, version + 1);
                project.checkConflictWith(previousProjectVersion);
            } else {
                project = new Project(id, name, 1);
            }
            map.put(VERSION, project.getVersion());
            project.setRaw(mapper.writeValueAsString(map));
            dataSource.put(project);
            return Response.status(Response.Status.CREATED).entity(project).build();
        } catch (ValidationException e) {
            throw conflictException("Performance Model is not saved", e.getMessage());
        } catch (IOException | NumberFormatException e) {
            throw badRequestException("Performance Model is not saved", e.getMessage());
        }
    }


}
