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

package org.maxur.perfmodel.backend;

import org.glassfish.hk2.api.TypeLiteral;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.infrastructure.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;

/**
 * This interface represents Perfomance Model Standalone Application
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
public abstract class Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    private PropertiesService propertiesService;

    private WebServer webServer;

    public abstract boolean isApplicable();

    public final void init() {
        propertiesService = PropertiesServiceFileImpl.make("/pm.properties");
        webServer = new WebServerGrizlyImpl();
        webServer.init(new RestServiceConfig(makeBinder()), propertiesService);
        onInit();
    }

    public final void start() {
        webServer.start();
        onStart();
        LOGGER.info("Performance Model Calculator Server is started");
    }

    public final void stop() {
        webServer.stop();
        onStop();
        LOGGER.info("Performance Model Calculator Server is stoped");
    }

    private AbstractBinder makeBinder() {
        return new AbstractBinder() {
            @Override
            protected void configure() {
                bind(propertiesService).to(PropertiesService.class);
                bind(webServer).to(WebServer.class);
                bindAsContract(new TypeLiteral<ProjectRepositoryLevelDbImpl>() {
                })
                        .to(new TypeLiteral<Repository<Project>>() {
                        })
                        .in(Singleton.class);
            }
        };
    }

    protected PropertiesService propertiesService() {
        return propertiesService;
    }

    protected WebServer webServer() {
        return webServer;
    }

    /**
     * Hook on Init
     */
    protected void onInit() {
    }

    /**
     * Hook on Start
     */
    protected void onStart() {
    }

    /**
     * Hook on Stop
     */
    protected void onStop() {
    }
}
