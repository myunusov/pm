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

import org.glassfish.hk2.api.TypeLiteral;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.infrastructure.PropertiesService;
import org.maxur.perfmodel.backend.infrastructure.SimpleFileRepository;
import org.maxur.perfmodel.backend.infrastructure.WebServer;
import org.maxur.perfmodel.backend.rest.PMObjectMapperProvider;
import org.slf4j.Logger;

import java.io.IOException;

import static org.slf4j.LoggerFactory.getLogger;

/**
 * @author Maxim Yunusov
 * @version 1.0 14.09.2014
 */
public class Launcher {

    private static final Logger LOGGER = getLogger(Launcher.class);

    private WebServer webServer;

    private PropertiesService propertiesService;

    public static void main(String[] args) throws Exception {
        final Launcher client = new Launcher();
        client.init();
        client.run();
    }

    private void init() {
        try {
            propertiesService = PropertiesService.make("/pm.properties");
            webServer = new WebServer(propertiesService);
            webServer.start(createApp());
        } catch (RuntimeException e) {
            LOGGER.error("System don't initialising", e);
        }
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
                        bind(propertiesService).to(PropertiesService.class);
                        bind(webServer).to(WebServer.class);
                        bindAsContract(new TypeLiteral<SimpleFileRepository>(){})
                                .to(new TypeLiteral<Repository<Project>>(){});
                    }
                });
            }
        };
    }

    private void run() throws IOException {
        final TrayIconApplication trayIconApplication = new TrayIconApplication(webServer, propertiesService);
        if (trayIconApplication.isReady()) {
            trayIconApplication.start();
        } else {
            System.out.println("Press Enter to stop\n");
            //noinspection ResultOfMethodCallIgnored
            System.in.read();
            done();
        }
    }

    private void done() {
        webServer.stop();
    }

}
