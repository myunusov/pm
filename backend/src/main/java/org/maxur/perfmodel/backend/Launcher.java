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

package org.maxur.perfmodel.backend;

import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.StaticHttpHandler;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.maxur.perfmodel.backend.domain.ProjectRepository;
import org.maxur.perfmodel.backend.infrastructure.SimpleFileRepository;
import org.maxur.perfmodel.backend.rest.PMObjectMapperProvider;
import org.slf4j.Logger;

import java.net.URI;

import static org.slf4j.LoggerFactory.getLogger;

/**
 * @author Maxim Yunusov
 * @version 1.0 14.09.2014
 */
public class Launcher {

    private static final Logger LOGGER = getLogger(Launcher.class);

    public static final String BASE_URL = "http://localhost:9090/";      // TODO

    public static final String WEB_APP_FOLDER_NAME = "webapp/";           // TODO

    public static final String WEB_APP_URL = "/";                         // TODO

    public static final String REST_APP_URL = "api/";                    // TODO

    private static final URI BASE_URI = URI.create(BASE_URL + REST_APP_URL);

    private HttpServer httpServer;

    public static void main(String[] args) throws Exception {
        final Launcher client = new Launcher();
        client.init();
        client.run();
        client.done();
    }

    private void init() {
        try {
            startWebServer();
            LOGGER.info("Starting on " + BASE_URL);
        } catch (RuntimeException e) {
            LOGGER.error("System don't initialising", e);
        }
    }

    private void startWebServer() {
        LOGGER.info("Start Web Server");
        httpServer = GrizzlyHttpServerFactory.createHttpServer(BASE_URI, createApp());
        httpServer.getServerConfiguration().addHttpHandler(new StaticHttpHandler(WEB_APP_FOLDER_NAME), WEB_APP_URL);
    }

    public ResourceConfig createApp() {
        return new ResourceConfig() {
            {
                packages("org.maxur.perfmodel.backend.rest");
                register(JacksonFeature.class);

                register(PMObjectMapperProvider.class);

                register(new AbstractBinder() {
                    @Override
                    protected void configure() {
                        bind(new SimpleFileRepository()).to(ProjectRepository.class);
                    }
                });
            }
        };
    }

    private void run() throws Exception {
        System.in.read();
    }



    private void done() {
        httpServer.shutdownNow();
    }


}
