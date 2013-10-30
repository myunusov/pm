package org.maxur.perfmodel.backeng;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;


/**
 * @author Maxim Yunusov
 * @version 1.0 01.09.13
 */
@Path("/{a:load|save}")
public class PMService {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String save(String message) {
        return header() + body() + footer();
    }


    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String load(@PathParam("id") String id) {
        return header() + body() + footer();
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
