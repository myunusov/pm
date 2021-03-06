/*
 * Copyright (c) 2015 Maxim Yunusov
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

package org.maxur.perfmodel.backend.service;

import org.slf4j.Logger;

import javax.inject.Named;

import static org.slf4j.LoggerFactory.getLogger;

/**
 * This Abstract class represents interface of Web Server.
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
public abstract class WebServer {

    private static final Logger LOGGER = getLogger(WebServer.class);

    protected static final String WEB_APP_URL = "/";

    @SuppressWarnings("unused")
    @Named("webapp.folderName")
    private String webappUrl;

    /**
     * Start Web server.
     */
    public void start() {
        LOGGER.info("Start Web Server ({})", version());
        launch();
        LOGGER.info("Starting on " + webappUrl);
    }

    /**
     * Restart Web server.
     */
    public void restart() {
        LOGGER.info("Restart Web Server");
        launch();
        LOGGER.info("Starting on " + webappUrl);
    }

    /**
     * Stop Web server.
     */
    public void stop() {
        LOGGER.info("Stop Web Server");
        shutdown();
    }

    protected abstract String version();

    protected abstract void launch();

    protected abstract void shutdown();

    public abstract boolean isStarted();

}
