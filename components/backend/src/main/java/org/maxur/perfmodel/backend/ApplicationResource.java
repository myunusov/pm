package org.maxur.perfmodel.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import static org.maxur.perfmodel.backend.WebException.notFoundException;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/29/13</pre>
 */
@Path("/{a:application}")
public class ApplicationResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    private String version;

    private void readVersionInfoInManifest(){
        final Package objPackage = ApplicationResource.class.getPackage();
        this.version = objPackage.getSpecificationVersion();
    }

    @GET
    @Path("/version")
    @Produces(MediaType.APPLICATION_JSON)
    public String getVersion() {
        if (this.version == null) {
            readVersionInfoInManifest();
        }
        if (this.version == null) {
            final String message = "Application version is not accessible";
            LOGGER.error(message);
            throw notFoundException(message);
        }
        return this.version;
    }

}
