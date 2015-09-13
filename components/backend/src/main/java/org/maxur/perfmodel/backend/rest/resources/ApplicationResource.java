package org.maxur.perfmodel.backend.rest.resources;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsondoc.core.annotation.*;
import org.jsondoc.core.pojo.ApiVerb;
import org.maxur.perfmodel.backend.service.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.maxur.perfmodel.backend.rest.WebException.badRequestException;
import static org.maxur.perfmodel.backend.utils.DateTimeUtils.schedule;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/29/13</pre>
 */
@Path("/{a:application}")
@Api(name = "Application Resource", description = "Methods for managing PMC Application")
@ApiVersion(since = "1.0")
public class ApplicationResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationResource.class);

    @Inject
    private Application application;

    @GET
    @Path("/version")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
        path = "/application/version",
        verb = ApiVerb.GET,
        description = "Gets a application version",
        produces = { MediaType.APPLICATION_JSON },
        responsestatuscode = "200 - OK"
    )
    @ApiErrors(apierrors={
            @ApiError(code="500", description="Application critical error")
    })
    public @ApiResponseObject String getVersion() {
        return application.version();
    }

    @PUT
    @Path("/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiMethod(
            path = "/application/status",
            verb = ApiVerb.PUT,
            description = "Sets a application status to stopped",
            produces = { MediaType.APPLICATION_JSON },
            consumes = { MediaType.APPLICATION_JSON },
            responsestatuscode = "200 - OK"
    )
    @ApiErrors(apierrors={
            @ApiError(code="500", description="Application critical error")
    })
    public Response action(@ApiBodyObject final String object) {
        try {
            final ObjectMapper mapper = new ObjectMapper(new JsonFactory());
            final Map<String, Object> map = mapper.readValue(object, new TypeReference<HashMap<String, Object>>() {
            });
            final String status = (String) map.get("status");
            switch (status) {
                case "stopped":
                    schedule(application::stop, 100);
                    break;
                default:
                    throw badRequestException("Status '%s' is not valid", status);
            }
            return Response.status(Response.Status.ACCEPTED).build();
        } catch (IOException e) {
            LOGGER.error("Operation is not valid", e);
            throw badRequestException("Operation is not valid", e.getMessage());
        }
    }
}