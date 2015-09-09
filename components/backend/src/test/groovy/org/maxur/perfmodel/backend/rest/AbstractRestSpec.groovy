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

package org.maxur.perfmodel.backend.rest

import org.glassfish.hk2.utilities.binding.AbstractBinder
import org.glassfish.jersey.jackson.JacksonFeature
import org.glassfish.jersey.server.ResourceConfig
import org.glassfish.jersey.test.JerseyTest
import spock.lang.Shared
import spock.lang.Specification

import javax.ws.rs.client.WebTarget
import javax.ws.rs.core.Application
/**
 * @author myunusov
 * @version 1.0
 * @since <pre>09.09.2015</pre>
 */
abstract class AbstractRestSpec extends Specification {

    abstract Class[] resources()

    abstract AbstractBinder testBinder()

    protected static <T> InstanceFactory<T> provider() {
        new InstanceFactory<>()
    }

    @Shared
    JerseyTest jersey = new JerseyTest() {
        @Override
        protected Application configure() {
            return new ResourceConfig() {
                {
                    register(testBinder());
                    for (resource in resources()) {
                        register(resource);
                    }
                    register(JacksonFeature.class)
                    register(PmcObjectMapperProvider.class)
                }
            }
        }
    }

    void setupSpec() {
        jersey.setUp()
    }

    void cleanupSpec() {
        jersey.tearDown()
    }

    WebTarget target() {
        return jersey.target();
    }

    WebTarget target(final String path) {
        return jersey.target(path);
    }


}
