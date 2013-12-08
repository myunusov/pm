package org.maxur.perfmodel.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.io.InputStream;
import java.util.jar.Manifest;

import static org.maxur.perfmodel.backend.WebException.notFoundException;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/29/13</pre>
 */
@Path("/{a:application}")
public class ApplicationResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectResource.class);

    private static final String APPLICATION_VERSION_IS_NOT_ACCESSIBLE = "Application version is not accessible";

    @Context
    private ServletContext servletContext;

    private String version;

    private void readVersionInfoInManifest() throws IOException {
        final InputStream inputStream = servletContext.getResourceAsStream("/META-INF/MANIFEST.MF");
        final Manifest manifest = new Manifest(inputStream);
        version = manifest.getMainAttributes().getValue("Implementation-Version");
    }

    @GET
    @Path("/version")
    @Produces(MediaType.APPLICATION_JSON)
    public String getVersion() {
        if (this.version == null) {
            try {
                readVersionInfoInManifest();
            } catch (IOException e) {
                LOGGER.error(APPLICATION_VERSION_IS_NOT_ACCESSIBLE, e);
                throw notFoundException(APPLICATION_VERSION_IS_NOT_ACCESSIBLE);
            }
        }
        if (this.version == null) {
            LOGGER.error(APPLICATION_VERSION_IS_NOT_ACCESSIBLE);
            throw notFoundException(APPLICATION_VERSION_IS_NOT_ACCESSIBLE);
        }
        return this.version;
    }

}
