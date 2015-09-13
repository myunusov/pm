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

import org.maxur.perfmodel.backend.domain.ConflictException
import org.maxur.perfmodel.backend.domain.Project
import org.maxur.perfmodel.backend.domain.Repository
import org.maxur.perfmodel.backend.service.DataSource
import spock.lang.Specification

import static java.util.Optional.empty

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
class ProjectRepositoryLevelDbImplSpec extends Specification {

    Repository<Project> sut
    DataSource ds

    void setup() {
        sut = new ProjectRepositoryLevelDbImpl();
        ds = Mock(DataSource);
        sut.dataSource = ds
    }

    def "test init"() {
        when:
        1 * ds.findAllByPrefix("/") >> []
        then:
        sut.findAll() as List == []
    }

    def "test add"() {
        given:
        def project = new Project('id1', 'name1', 1, "")
        project.setView('{}')
        project.setModels('[]')
        when:
        def result = sut.add(project)
        then:
        1 * ds.get("/name1") >> empty()
        1 * ds.get("id1") >> empty()
        1 * ds.put("/name1", project)
        1 * ds.put("id1", project) >> {
            key, value -> assert (value.version == 1)
        }
        and:
        result.get() == project
        result.get().version == 1
    }

    def "test add with non-unique id"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        def project2 = new Project('id1', 'name2', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        when:
        sut.add(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        0 * ds.put("/name1", _)
        0 * ds.put("id1", _)
        and:
        ConflictException ex = thrown()
        ex.message == 'Another project with same id \'id1\' already exists.'
    }

    def "test add same project"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        def project2 = new Project('id1', 'name1', 1, "")
        project2.setView('{}')
        project2.setModels('[]')
        when:
        def result = sut.add(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        0 * ds.put("/name1", project1)
        0 * ds.put("id1", project1) >> {
            key, value -> assert (value.version == 1)
        }
        and:
        result.get() == project1
        result.get().version == 1
    }


    def "test add with non-unique name"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        def project2 = new Project('id2', 'name1', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        when:
        sut.add(project1)
        then:
        1 * ds.get("id1") >> empty()
        1 * ds.get("/name1") >> Optional.of(project2)
        0 * ds.put("/name1", _)
        0 * ds.put("id1", _)
        and:
        ConflictException ex = thrown()
        ex.message == 'Another project with same \'name1\' already exists.'
    }

    def "test amend"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "ddd")
        project1.setView('{}')
        project1.setModels('[]')

        def project2 = new Project('id1', 'name1', 1, "")
        project2.setView('{}')
        project2.setModels('[]')
        when:
        def result = sut.amend(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        1 * ds.put("/name1", project1)
        1 * ds.put("id1", project1) >> {
            key, value -> assert (value.version == 2)
        }
        and:
        result.get() == project1
        result.get().version == 2
    }

    def "amend must be idempotent operation"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        def project2 = new Project('id1', 'name1', 2, "")
        project2.setView('{}')
        project2.setModels('[]')
        when:
        def result = sut.amend(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        0 * ds.put("/name1", project1)
        0 * ds.put("id1", project1)
        and:
        result.get() == project1
        result.get().version == 2
    }

    def "test amend with conflict"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        def project2 = new Project('id1', 'name1', 3, "")
        when:
        sut.amend(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        0 * ds.put("/name1", _)
        0 * ds.put("id1", _)
        and:
        ConflictException ex = thrown()
        ex.message == 'Project \'name1\' has been changed by another user.'
    }

    def "test amend with rename"() {
        given:
        def project1 = new Project('id1', 'name1', 1, "")
        def project2 = new Project('id1', 'name2', 1, "")
        when:
        def result = sut.amend(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        1 * ds.get("/name1") >> empty()
        1 * ds.put("/name1", project1)
        1 * ds.put("id1", project1) >> {
            key, value -> assert (value.name == 'name1')
        }
        and:
        result.get() == project1
    }


    def "test amend with rename and namesake"() {
        given:
        def project1 = new Project('id1', 'name2', 1, "")
        project1.setView('{}')
        project1.setModels('[]')
        def project2 = new Project('id1', 'name1', 1, "")
        def project3 = new Project('id2', 'name2', 1, "")
        when:
        sut.amend(project1)
        then:
        1 * ds.get("id1") >> Optional.of(project2)
        1 * ds.get("/name2") >> Optional.of(project3)
        0 * ds.put("/name1", _)
        0 * ds.put("id1", _)
        and:
        ConflictException ex = thrown()
        ex.message == 'Another project with same \'name2\' already exists.'
    }

   def "test remove"() {
        given:
        def project = new Project('id1', 'name1', 1, "")
        project.setView('{}')
        project.setModels('[]')
        when:
        def result = sut.remove('id1')
        then:
        1 * ds.get("id1") >> Optional.of(project)
        1 * ds.delete("id1")
        1 * ds.delete("/name1")
        and:
        result.get() == project
    }

    def "test remove if project is absent"() {
        given:
        def project = new Project('id1', 'name1', 1, "")
        project.setView('{}')
        project.setModels('[]')
        when:
        def result = sut.remove('id1')
        then:
        1 * ds.get("id1") >> empty()
        0 * ds.delete(_)
        0 * ds.delete(_)
        and:
        !result.isPresent()
    }


}
