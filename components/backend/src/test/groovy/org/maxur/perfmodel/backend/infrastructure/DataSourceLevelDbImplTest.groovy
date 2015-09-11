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

package org.maxur.perfmodel.backend.infrastructure

import spock.lang.Specification

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>11.09.2015</pre>
 */
class DataSourceLevelDbImplTest extends Specification {

    DataSourceLevelDbImpl ds

    void setup() {
        ds = new DataSourceLevelDbImpl();
        ds.dbFolderName = "./test.db"
        ds.init()
    }

    void cleanup() {
        ds.stop();
        def result = new File("./test.db").deleteDir()
        assert result
    }

    def "test init"() {
        when:
        ds.init()
        then:
        ds.db != null

    }

    def "test get with empty"() {
        when:
        Optional result = ds.get("key")
        then:
        !result.isPresent()
    }

    def "test put"() {
        given:
        def object = new Fake(1);
        when:
        ds.put("key", object)
        then:
        ds.get("key").get() == object
    }

    def "test findAllByPrefix"() {
        given:
        def object1 = new Fake(1);
        def object2 = new Fake(2);
        when:
        ds.put("key1", object1)
        ds.put("key2", object2)
        def result = ds.findAllByPrefix("key")
        then:
        result.contains(object1)
        result.contains(object2)
    }

    def "test delete"() {
        given:
        def object = new Fake(1);
        when:
        ds.put("key", object)
        ds.delete("key")
        Optional result = ds.get("key")
        then:
        !result.isPresent()
    }

    static class Fake implements Serializable {

        private final int id

        Fake(int id) {
            this.id = id
        }

        boolean equals(o) {
            if (this.is(o)) return true
            if (!(o instanceof Fake)) return false
            return (id == ((Fake) o).id)
        }

        int hashCode() {
            return id
        }
    }
}
