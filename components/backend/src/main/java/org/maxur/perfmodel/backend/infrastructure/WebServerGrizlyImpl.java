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
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.slf4j.Logger;

import java.net.URI;

import static org.slf4j.LoggerFactory.getLogger;

public class WebServerGrizlyImpl extends WebServer {

    private static final Logger LOGGER = getLogger(WebServerGrizlyImpl.class);

    private HttpServer httpServer;

    @Override
    protected void launch() {
        httpServer = GrizzlyHttpServerFactory.createHttpServer(
                URI.create(baseUrl() + REST_APP_URL),
                getConfig()
        );
        httpServer.getServerConfiguration().addHttpHandler(
                new StaticHttpHandler(webAppFolderName()),
                WEB_APP_URL
        );
    }

    @Override
    protected void shutdown() {
        httpServer.shutdownNow();
    }


    @Override
    public boolean isStarted() {
        return httpServer.isStarted();
    }
}