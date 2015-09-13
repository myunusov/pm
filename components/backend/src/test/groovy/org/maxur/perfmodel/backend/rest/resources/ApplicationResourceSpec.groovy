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

package org.maxur.perfmodel.backend.rest.resources

import org.glassfish.hk2.utilities.binding.AbstractBinder
import org.maxur.perfmodel.backend.rest.AbstractRestSpec
import org.maxur.perfmodel.backend.rest.InstanceFactory
import org.maxur.perfmodel.backend.service.Application
import spock.lang.Shared

import javax.ws.rs.core.Response

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>12.09.2015</pre>
 */
class ApplicationResourceSpec extends AbstractRestSpec {

    @Shared
    InstanceFactory<Application> provider  = provider()

    @Override
    Class[] resources() {
        return [ApplicationResource]
    }

    @Override
    AbstractBinder testBinder() {
        return new AbstractBinder() {
            @Override
            protected void configure() {
                bindFactory(provider).to(Application);
            }
        }
    }


    def "test getVersion"() {
        setup:
        provider.set(Mock(Application) {
            1 * version() >> 1
        })
        when: "send GET request on application"
        Response response = target("/application/version")
                .request()
                .buildGet()
                .invoke();

        then: "returns Application version"
        response.hasEntity()
        response.readEntity(String) == "1";
    }

/*    def "test PUT stopped status"() {
        setup:
        Application mock = Mock(type: new TypeToken<Application>() {}.type) as Application
        provider.set(mock)
        when: "send GET request on application"
        target("/application/status")
                .request()
                .buildPut(json("""{"status": "stopped"}"""))
                .invoke();
        then: "Application has stopped"
        1 * mock.stop()
    }
*/
}
