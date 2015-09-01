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

import org.glassfish.hk2.api.InterceptionService;
import org.glassfish.hk2.api.TypeLiteral;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.infrastructure.ProjectRepositoryLevelDbImpl;
import org.maxur.perfmodel.backend.infrastructure.PropertiesService;
import org.maxur.perfmodel.backend.infrastructure.PropertiesServiceFileImpl;
import org.maxur.perfmodel.backend.infrastructure.WebServerGrizlyImpl;
import org.maxur.perfmodel.backend.service.Application;
import org.maxur.perfmodel.backend.service.HK2InterceptionService;
import org.maxur.perfmodel.backend.service.WebServer;

import javax.inject.Singleton;

/**
 * Application Configurations
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>01.09.2015</pre>
 */
final class Config extends AbstractBinder {

    private final PropertiesService propertiesService = PropertiesServiceFileImpl.make("/pm.properties");

    @Override
    protected void configure() {
        bind(HK2InterceptionService.class)
                .to(InterceptionService.class)
                .in(Singleton.class);
        bind(propertiesService)
                .to(PropertiesService.class);
        bind(WebServerGrizlyImpl.class)
            .to(WebServer.class)
            .in(Singleton.class);
        bindAsContract(new TypeLiteral<ProjectRepositoryLevelDbImpl>() {
        }).to(new TypeLiteral<Repository<Project>>() {
        }).in(Singleton.class);
        bindFactory(ApplicationProvider.class)
            .to(Application.class)
            .in(Singleton.class);
    }
}
