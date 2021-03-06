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

package org.maxur.perfmodel.backend.rest;

import org.glassfish.jersey.ServiceLocatorProvider;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.core.Feature;
import javax.ws.rs.core.FeatureContext;

/**
 * Rest Service Configuration
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
public class RestServiceConfig extends ResourceConfig {

    public RestServiceConfig() {
        packages("org.maxur.perfmodel.backend.rest.resources");
        register(JacksonFeature.class);
        register(PmcObjectMapperProvider.class);
        register(RuntimeExceptionHandler.class);
        register(new ServiceLocatorFeature());
    }

    static class ServiceLocatorFeature implements Feature {

        @Override
        public boolean configure(FeatureContext context) {
            ServiceLocatorProvider.getServiceLocator(context);
            return true;
        }
    }

}
