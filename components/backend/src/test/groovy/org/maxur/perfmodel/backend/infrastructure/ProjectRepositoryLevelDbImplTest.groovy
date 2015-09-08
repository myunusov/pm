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
        sut.dbFolderName = "./test.db"
        sut.init()
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
        sut.findAll() as List == []
    }

    def "test put"() {
        given:
        def project = new Project('id1', 'name1', 1, "")
        project.setView('{}')
        project.setModels('[]')
        when:
        sut.init()
        sut.put(project)
        then:
        def all = sut.findAll()
        all as List == [project]
        all[0].getView() == null
        all[0].getModels() == null
        and:
        sut.get('id1').get() == project;
        project.getView() == '{}'
        project.getModels() == '[]'
    }

    def "test remove"() {
        given:
        def project = new Project('id2', 'name2', 1, "")
        project.setView('{}')
        project.setModels('[]')
        when:
        sut.init()
        sut.put(project)
        sut.remove('id2')
        then:
        sut.findAll() as List == []
        and:
        !sut.get('id1').isPresent()
    }

    def "test rename"() {
        given:
        def project1 = new Project('id3', 'name1', 1, "")
        def project2 = new Project('id3', 'name2', 2, "")
        when:
        sut.init()
        sut.put(project1)
        sut.put(project2)
        then:
        sut.findAll() as List == [project2]
        and:
        def project = sut.get('id3')
        project.get() == project2
        project.get().name == 'name2'
    }

}
