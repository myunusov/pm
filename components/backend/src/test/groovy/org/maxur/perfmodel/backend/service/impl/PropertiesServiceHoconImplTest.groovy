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

package org.maxur.perfmodel.backend.service.impl

import com.typesafe.config.Config
import com.typesafe.config.ConfigException
import spock.lang.Specification

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>05.10.2015</pre>
 */
class PropertiesServiceHoconImplTest extends Specification {

    def "test asURI"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        def result = sut.asURI("a")
        then:
        1 * sut.userConfig.getString("a") >> "A"
        and:
        result == URI.create("A")
    }

    def "test asString"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        def result = sut.asString("a")
        then:
        1 * sut.userConfig.getString("a") >> "A"
        and:
        result == "A"
    }

    def "test asString with Default value"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        def result = sut.asString("a")
        then:
        1 * sut.userConfig.getString("a") >> { throw new ConfigException.Missing("a") }
        1 * sut.defaultConfig.getString("a") >> "A"
        and:
        result == "A"
    }

    def "test asInteger"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        def result = sut.asInteger("a")
        then:
        1 * sut.userConfig.getInt("a") >> 1
        and:
        result == 1
    }

    def "test asInteger with Default value"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        def result = sut.asInteger("a")
        then:
        1 * sut.userConfig.getInt("a") >> { throw new ConfigException.Missing("a") }
        1 * sut.defaultConfig.getInt("a") >> 1
        and:
        result == 1
    }

    def "test asInteger with Invalid value"() {
        given:
        def sut = new PropertiesServiceHoconImpl()
        sut.defaultConfig = Mock(Config);
        sut.userConfig = Mock(Config);
        when:
        sut.asInteger("a")
        then:
        1 * sut.userConfig.getInt("a") >> { throw new ConfigException.Missing("a") }
        1 * sut.defaultConfig.getInt("a") >> { throw new ConfigException.Missing("a") }
        and:
        thrown(ConfigException.Missing)
    }

}
