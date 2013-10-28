/*
 * Copyright (c) 2013 Maxim Yunusov
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

package org.maxur.perfmodel.server;

import org.apache.catalina.Context;
import org.apache.catalina.core.AprLifecycleListener;
import org.apache.catalina.core.StandardServer;
import org.apache.catalina.startup.Tomcat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>10/4/13</pre>
 */
public final class Launcher {

    private static final Logger LOGGER = LoggerFactory.getLogger(Launcher.class);

    private static final int PORT = 8089;

    private static final String HOST = "localhost";

    public static final String TOMCAT_DIR_NAME = "tomcat";

    private static final File BASE_DIR = new File(TOMCAT_DIR_NAME);


    public static final int SHUTDOWN_PORT = 6666;

    public static final String SHUTDOWN_KEY = "shutdown";

    public static final String WEBAPP_DIR_NAME = "webapp";


    public static void main(final String[] args) {
        try {
            final Tomcat tomcat = new Tomcat();

            // Add AprLifecycleListener
            final StandardServer server = (StandardServer) tomcat.getServer();
            final AprLifecycleListener listener = new AprLifecycleListener();
            server.addLifecycleListener(listener);

            tomcat.setPort(PORT);
            tomcat.setHostname(HOST);
            tomcat.setBaseDir(BASE_DIR.getAbsolutePath());

            tomcat.getServer().setPort(SHUTDOWN_PORT);
            tomcat.getServer().setShutdown(SHUTDOWN_KEY);

            tomcat.getHost().setCreateDirs(true);
            tomcat.getHost().setDeployIgnore(null);
            tomcat.getHost().setDeployOnStartup(true);
            tomcat.getHost().setAutoDeploy(true);
            tomcat.getHost().setAppBase(TOMCAT_DIR_NAME);

            final File webapp = new File(TOMCAT_DIR_NAME, WEBAPP_DIR_NAME);
            final Context webAppCtx = tomcat.addWebapp("/" + WEBAPP_DIR_NAME, webapp.getAbsolutePath());
            webAppCtx.setReloadable(true);
            LOGGER.info("Configuring app with basedir: " + webapp.getAbsolutePath());
            tomcat.start();
            LOGGER.info(String.format("Go to http://%s:%d/ to check out your embedded web server!", HOST, PORT));
            tomcat.getServer().await();
        } catch (Exception ex) {
            LOGGER.error(ex.getMessage(), ex);
        }
    }

    private Launcher() {
        //empty - prevent construction
    }

}