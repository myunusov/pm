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

import org.jvnet.hk2.annotations.Contract;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.infrastructure.PropertiesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

/**
 * This interface represents Perfomance Model Standalone Application
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
@Contract
public abstract class Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    @Inject
    private PropertiesService propertiesService;

    @Inject
    private WebServer webServer;

    @Inject
    private Repository<Project> repository;


    @PostConstruct
    public final void init() {
        onInit();
    }

    public final void start() {
        webServer.start();
        onStart();
        LOGGER.info("Performance Model Calculator Server is started");
    }

    public final void stop() {
        webServer.stop();
        repository.stop();
        onStop();
        LOGGER.info("Performance Model Calculator Server is stoped");
        System.exit(0);
    }

    public String version() {
        return this.getClass().getPackage().getImplementationVersion();
    }

    protected final PropertiesService propertiesService() {
        return propertiesService;
    }

    protected final  WebServer webServer() {
        return webServer;
    }

    /**
     * Returns true if Application is applicable.
     *
     * @return true if Application is applicable
     */
    public abstract boolean isApplicable();

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
