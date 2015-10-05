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

package org.maxur.perfmodel.backend.service.impl;

import org.glassfish.grizzly.Grizzly;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.StaticHttpHandler;
import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.jersey.server.ResourceConfig;
import org.maxur.perfmodel.backend.service.WebServer;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.ext.Provider;
import java.net.URI;

import static org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory.createHttpServer;

@Provider
public class WebServerGrizzlyImpl extends WebServer {

    private HttpServer httpServer;

    @Inject
    private ResourceConfig config;

    @Inject
    private ServiceLocator locator;

    @SuppressWarnings("unused")
    @Named("webapp.folderName")
    private String webappFolderName;

    @SuppressWarnings("unused")
    @Named("api.url")
    private URI apiUri;


    @Override
    protected void launch() {
        httpServer = createHttpServer(apiUri, config, locator);
        httpServer.getServerConfiguration().addHttpHandler(
                new StaticHttpHandler(webappFolderName),
                WEB_APP_URL
        );
    }

    @Override
    protected void shutdown() {
        httpServer.shutdownNow();
    }

    @Override
    protected String version() {
        return "Grizzly Http Server " + Grizzly.getDotedVersion();
    }

    @Override
    public boolean isStarted() {
        return httpServer.isStarted();
    }
}