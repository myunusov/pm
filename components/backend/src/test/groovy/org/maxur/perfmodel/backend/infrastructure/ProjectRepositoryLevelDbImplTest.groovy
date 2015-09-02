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
import org.maxur.perfmodel.backend.domain.Project
import spock.lang.Specification
/**
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
class ProjectRepositoryLevelDbImplTest extends Specification {

    ProjectRepositoryLevelDbImpl sut


    void setup() {
        sut = new ProjectRepositoryLevelDbImpl();
        sut.propertiesService = propertiesService;
    }

    void cleanup() {
        sut.stop();
        def result = new File("./test.db").deleteDir()
        assert result
    }

    def "test init"() {
        when:
        sut.init()
        then:
        1 * propertiesService.dbPath() >> "./test.db"
        and:
        sut.findAll() == []
    }

    def "test put"() {
        given:
        def project = new Project('id1', 'name1', 1)
        project.setRaw('{}')
        when:
        sut.init()
        sut.put(project)
        then:
        1 * propertiesService.dbPath() >> "./test.db"
        and:
        def all = sut.findAll()
        all == [project]
        all[0].getRaw() == ''
        and:
        sut.get('id1') == project;
        project.getRaw() == '{}'
    }

    def "test remove"() {
        given:
        def project = new Project('id2', 'name2', 1)
        project.setRaw('{}')
        when:
        sut.init()
        sut.put(project)
        sut.remove('id2')
        then:
        1 * propertiesService.dbPath() >> "./test.db"
        and:
        sut.findAll() == []
        and:
        sut.get('id1') == null
    }

    def "test rename"() {
        given:
        def project1 = new Project('id3', 'name1', 1)
        def project2 = new Project('id3', 'name2', 2)
        when:
        sut.init()
        sut.put(project1)
        sut.put(project2)
        then:
        1 * propertiesService.dbPath() >> "./test.db"
        and:
        sut.findAll() == [project2]
        and:
        def project = sut.get('id3')
        project == project2;
        project.name == 'name2'
    }

}
