package org.maxur.perfmodel.backeng;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;


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
    public String save(String message) {
        data.put("1", message);   // TODO
        return header() + body() + footer();
    }


    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam("id") String id) {
        return data.get("1");
    }

    private String header() {
        return "[";
    }

    private String footer() {
        return "]";
    }

    private String body() {
        return "{'result' : 'success'}";
    }

}
