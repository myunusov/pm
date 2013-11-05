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
    public Response save(final String message) {
        try {
            final JSONObject qnm = new JSONObject(message);
            final String id = qnm.getString("id");
            data.put(id, message);
            return Response.status(Response.Status.CREATED).entity(id).build();
        } catch (JSONException e) {
            throw notFoundException(
                    "Performance Model with id = '%s' is not saved",
                    e.getMessage()
            );
        }
    }


    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam("id") String id) {
        final String model = data.get(id);
        if (model == null) {
            throw notFoundException(String.format("Performance Model with id = '%s' is not founded", id));
        }
        return model;
    }

}
