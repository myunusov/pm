package org.maxur.perfmodel.backend.rest;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.maxur.perfmodel.backend.infrastructure.WebServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.maxur.perfmodel.backend.rest.WebException.badRequestException;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/29/13</pre>
 */
@Path("/{a:application}")
public class ApplicationResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationResource.class);

    @Inject
    private WebServer webServer;

    @GET
    @Path("/version")
    @Produces(MediaType.APPLICATION_JSON)
    public String getVersion() {
        return this.getClass().getPackage().getImplementationVersion();
    }

    @PUT
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response action(final String object) {
        try {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Map<String, Object> map = mapper.readValue(object, new TypeReference<HashMap<String, Object>>() {
            });
            final String status = (String) map.get("status");
            if ("stopped".equals(status)) {
                webServer.stopWithDelay(100);
            }
            return Response.status(Response.Status.ACCEPTED).build();
        } catch (IOException e) {
            LOGGER.error("Operation is not valid", e);
            throw badRequestException("Operation is not valid", e.getMessage());
        }
    }
}