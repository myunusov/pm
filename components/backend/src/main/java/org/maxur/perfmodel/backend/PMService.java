package org.maxur.perfmodel.backend;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

import static org.maxur.perfmodel.backend.WebException.badRequestException;
import static org.maxur.perfmodel.backend.WebException.conflictException;
import static org.maxur.perfmodel.backend.WebException.notFoundException;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:load|save}")
public class PMService {

    final private static Map<String, String> data = new HashMap<>();     // TODO

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response save(final String object) {
        try {
            final JSONObject qnm = new JSONObject(object);
            final String error = checkConflict(qnm);
            if (error != null) {
                throw conflictException("Performance Model is not saved", error);
            }
            int version = qnm.getInt("version");
            qnm.put("version", ++version);
            final String name = qnm.getString("name");
            data.put(name, qnm.toString());
            return Response.status(Response.Status.CREATED).entity(name).build();
        } catch (JSONException e) {
            throw badRequestException("Performance Model is not saved", e.getMessage());
        }
    }

    private String checkConflict(JSONObject newQNModel) throws JSONException {
        final String newName = newQNModel.getString("name");
        final String oldObject  = data.get(newName);
        if (oldObject != null) {
            final JSONObject oldQNModel = new JSONObject(oldObject);
            final String newId = newQNModel.getString("id");
            final String oldId = oldQNModel.getString("id");
            if (!newId.equals(oldId)) {
                return String.format("Performance Model '%s' already exists.", newName);
            }
            int newVersion = newQNModel.getInt("version");
            int oldVersion = oldQNModel.getInt("version");
            if (newVersion != oldVersion) {
                return String.format("Performance Model '%s' has already been changed by another user.", newName);
            }
        }
        return null;
    }

    @GET
    @Path("/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam("name") String name) {
        final String model = data.get(name);
        if (model == null) {
            throw notFoundException(String.format("Performance Model '%s' is not founded", name));
        }
        return model;
    }

}
