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

import org.glassfish.hk2.api.InjectionResolver;
import org.glassfish.hk2.api.InterceptionService;
import org.glassfish.hk2.api.TypeLiteral;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.server.ResourceConfig;
import org.maxur.perfmodel.backend.domain.ProjectRepository;
import org.maxur.perfmodel.backend.infrastructure.DataSourceLevelDbImpl;
import org.maxur.perfmodel.backend.infrastructure.ProjectRepositoryLevelDbImpl;
import org.maxur.perfmodel.backend.rest.RestServiceConfig;
import org.maxur.perfmodel.backend.service.*;
import org.maxur.perfmodel.backend.service.impl.PropertiesServiceHoconImpl;
import org.maxur.perfmodel.backend.service.impl.WebServerGrizzlyImpl;

import javax.inject.Named;
import javax.inject.Singleton;

/**
 * Application Configurations
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>01.09.2015</pre>
 */
final class Config extends AbstractBinder {

    @Override
    protected void configure() {
        bind(ConfigurationInjectionResolver.class)
                .to(new TypeLiteral<InjectionResolver<Named>>() {
                })
                .in(Singleton.class);
        bind(RestServiceConfig.class)
                .to(ResourceConfig.class)
                .in(Singleton.class);
        bind(HK2InterceptionService.class)
                .to(InterceptionService.class)
                .in(Singleton.class);
        bind(PropertiesServiceHoconImpl.class)
                .to(PropertiesService.class)
                .in(Singleton.class);
        bind(WebServerGrizzlyImpl.class)
                .to(WebServer.class)
                .in(Singleton.class);
        bind(DataSourceLevelDbImpl.class)
                .to(DataSource.class)
                .in(Singleton.class);
        bind(DataSourceLevelDbImpl.class)
                .to(Database.class)
                .in(Singleton.class);
        bind(ProjectRepositoryLevelDbImpl.class)
                .to(ProjectRepository.class)
                .in(Singleton.class);
        bindFactory(ApplicationProvider.class)
                .to(Application.class)
                .in(Singleton.class);
    }
}
