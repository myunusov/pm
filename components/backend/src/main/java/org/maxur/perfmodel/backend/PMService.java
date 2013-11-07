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

import static org.maxur.perfmodel.backend.WebException.badRequestException;
import static org.maxur.perfmodel.backend.WebException.conflictException;
import static org.maxur.perfmodel.backend.WebException.notFoundException;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:qnm}")
public class PMService {

    public static final String NAME = "name";

    public static final String VERSION = "version";

    public static final String ID = "id";

    private final DataSource dataSource = new MemoryDataSource();

    @GET
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam(NAME) String name) {
        final String model = dataSource.get(name);
        if (model == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return model;
    }

    @DELETE
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String delete(@PathParam(NAME) String name) {
        final String model = dataSource.remove(name);
        if (model == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return model;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public synchronized Response save(final String object) {
        try {
            final JSONObject qnm = new JSONObject(object);
            final String error = checkConflict(qnm);
            if (error != null) {
                throw conflictException("Performance Model is not saved", error);
            }
            int version = qnm.getInt(VERSION);
            qnm.put(VERSION, ++version);
            final String name = qnm.getString(NAME);
            dataSource.put(name, qnm.toString());
            return Response.status(Response.Status.CREATED).entity(name).build();
        } catch (JSONException e) {
            throw badRequestException("Performance Model is not saved", e.getMessage());
        }
    }

    private String checkConflict(final JSONObject newQNModel) throws JSONException {
        final String newName = newQNModel.getString(NAME);
        final String oldObject  = dataSource.get(newName);
        if (oldObject != null) {
            final JSONObject oldQNModel = new JSONObject(oldObject);
            final String newId = newQNModel.getString(ID);
            final String oldId = oldQNModel.getString(ID);
            if (!newId.equals(oldId)) {
                return String.format("Performance Model '%s' already exists.", newName);
            }
            int newVersion = newQNModel.getInt(VERSION);
            int oldVersion = oldQNModel.getInt(VERSION);
            if (newVersion != oldVersion) {
                return String.format("Performance Model '%s' has already been changed by another user.", newName);
            }
        }
        return null;
    }

}
