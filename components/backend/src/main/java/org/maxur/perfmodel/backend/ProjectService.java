package org.maxur.perfmodel.backend;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;

import static org.maxur.perfmodel.backend.WebException.badRequestException;
import static org.maxur.perfmodel.backend.WebException.conflictException;
import static org.maxur.perfmodel.backend.WebException.notFoundException;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:projects}")
public class ProjectService {

    public static final String NAME = "name";

    public static final String VERSION = "version";

    public static final String ID = "id";

    private final DataSource dataSource = new MemoryDataSource();

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Collection<Project> findAll() {
        return dataSource.findAll();
    }

    @GET
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam(NAME) String name) {
        final Project project = dataSource.get(name);
        if (project == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return project.getRaw().toString();
    }

    @DELETE
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public Project delete(@PathParam(NAME) String name) {
        final Project project = dataSource.remove(name);
        if (project == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return  project;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response save(final String object) {
        try {
            final JSONObject raw = new JSONObject(object);
            final Project project = new Project(
                    raw,
                    raw.getString(ID),
                    raw.getString(NAME),
                    raw.getInt(VERSION)
            );
            final Project previousProjectVersion = dataSource.get(project.getName());
            project.checkConflictWith(previousProjectVersion);
            project.incVersion();
            raw.put("version", project.getVersion());
            dataSource.put(project);
            return Response.status(Response.Status.CREATED).entity(project).build();
        } catch (ValidationException e) {
            throw conflictException("Performance Model is not saved", e.getMessage());
        } catch (JSONException e) {
            throw badRequestException("Performance Model is not saved", e.getMessage());
        }
    }


}
