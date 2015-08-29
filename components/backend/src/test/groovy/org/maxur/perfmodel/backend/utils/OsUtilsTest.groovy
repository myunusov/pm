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

package org.maxur.perfmodel.backend.utils

import mockit.Mock
import mockit.MockUp
import spock.lang.Specification


/**
 * @author myunusov
 * @version 1.0
 * @since <pre>28.08.2015</pre>
 */
class OsUtilsTest extends Specification {

    def "shoud be get os name from system property"() {
        setup:
        def mockUp = new MockUp<OsUtils>() {
            @Mock
            public static String getOsName() {
                return "TEST";
            }
        }
        when: "get os name"
        def osName = OsUtils.getOsName()

        then: "os name will be 'TEST'"
        osName == "TEST"

        cleanup:
        mockUp.tearDown()
    }

    def "should be detect Windows by it's name"() {
        setup:
        def mockUp = new MockUp<OsUtils>() {
            @Mock
            public static String getOsName() {
                return "windows 8.1";
            }
        }
        when: "detect windows os"
        def isWindows = OsUtils.isWindows()

        then: "it's Windows"
        isWindows

        cleanup:
        mockUp.tearDown()
    }

    def "should be detect unix by it's name"() {
        setup:
        def mockUp = new MockUp<OsUtils>() {
            @Mock
            public static String getOsName() {
                return "unix";
            }
        }
        when: "detect Unix os"
        def isUnix = OsUtils.isUnix()

        then: "it's Unix"
        isUnix

        cleanup:
        mockUp.tearDown()
    }

    def "should be detect Solaris by it's name"() {
        setup:
        def mockUp = new MockUp<OsUtils>() {
            @Mock
            public static String getOsName() {
                return "sunos";
            }
        }
        when: "detect Solaris os"
        def isSolaris = OsUtils.isSolaris()

        then: "it's Solaris"
        isSolaris

        cleanup:
        mockUp.tearDown()
    }

    def "should be detect MacOs by it's name"() {
        setup:
        def mockUp = new MockUp<OsUtils>() {
            @Mock
            public static String getOsName() {
                return "mac";
            }
        }
        when: "detect MacOs os"
        def isMac = OsUtils.isMac()

        then: "it's MacOs"
        isMac

        cleanup:
        mockUp.tearDown()
    }

}
