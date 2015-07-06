/*
 * Copyright (c) 2014 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package org.maxur.perfmodel.backend.infrastructure;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.StaticHttpHandler;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;
import org.slf4j.Logger;

import java.net.URI;

import static org.slf4j.LoggerFactory.getLogger;

public class WebServer {

    private static final Logger LOGGER = getLogger(WebServer.class);

    private static final String WEB_APP_URL = "/";

    private static final String REST_APP_URL = "api/";


    private String baseUrl;

    private String webappFolderName;

    private HttpServer httpServer;
    private ResourceConfig config;

    public WebServer(PropertiesService propertiesService) {
        baseUrl = propertiesService.asString("webapp.url", "http://localhost:9090/");
        webappFolderName =  propertiesService.asString("webapp.folderName", "webapp/");
    }

    public void start(final ResourceConfig config) {
        LOGGER.info("Start Web Server");
        this.config = config;
        launch(config);
        LOGGER.info("Starting on " + baseUrl);
    }

    public void restart() {
        LOGGER.info("Restart Web Server");
        launch(config);
        LOGGER.info("Starting on " + baseUrl);
    }

    private void launch(ResourceConfig config) {
        httpServer = GrizzlyHttpServerFactory.createHttpServer(URI.create(baseUrl + REST_APP_URL), config);
        httpServer.getServerConfiguration().addHttpHandler(new StaticHttpHandler(webappFolderName), WEB_APP_URL);
    }

    public void stop() {
        httpServer.shutdownNow();
    }

    public boolean isStarted() {
        return httpServer.isStarted();
    }


}