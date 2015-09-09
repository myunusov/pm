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
import org.maxur.perfmodel.backend.domain.Project
import org.maxur.perfmodel.backend.domain.Repository
import org.maxur.perfmodel.backend.rest.dto.ProjectDto
import org.maxur.perfmodel.backend.rest.resources.ProjectResource
import spock.lang.Specification

import javax.ws.rs.client.Entity
import javax.ws.rs.core.GenericType
import javax.ws.rs.core.Response
/**
 * @author myunusov
 * @version 1.0
 * @since <pre>29.08.2015</pre>
 */
class ProjectResourceTest extends Specification {

    static InMemoryRestServer server
    static sut

    Repository<Project> repository

    def project, project1, project2

    // run before the first feature method
    def setupSpec() {
        sut = new ProjectResource();
        server = InMemoryRestServer.create(sut);
    }

    // run after the last feature method
    def cleanupSpec() {
        server.close();
    }

    def "should be return projects by GET request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project")
                .request()
                .buildGet()
                .invoke();

        then: "Project List was returned"
        response.hasEntity()
        List<ProjectDto> projects = response.readEntity(new GenericType<List<ProjectDto>>() {});
        and: "method findAll of project repository was called"
        1 * repository.findAll() >> [project];
        and: "sevrer returned project from repository"
        projects.size() ==  1
        projects.get(0).id == "id1"
        projects.get(0).name == "name"
        projects.get(0).version == 1
        projects.get(0).view == "{}"
        projects.get(0).models == "[]"
    }

    def "should be return 404 code by GET request unavailable project"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/invalid")
                .request()
                .buildGet()
                .invoke();

        then: "method get of project repository was called"
        1 * repository.get("invalid") >> Optional.empty();
        and: "Project was not returned"
        response.status == 404
        String rawProject = response.readEntity(String.class);
        rawProject == "[{\"message\":\"Project 'invalid' is not founded\"}]"
    }


    def "should be return project by GET request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildGet()
                .invoke()

        then: "method get of project repository was called"
        1 * repository.get("id1") >> Optional.of(project)
        and: "Project was returned"
        response.hasEntity()
        response.status == 200
        String rawProject = response.readEntity(String.class);

        and: "server returned project from repository"
        rawProject == """{"id":"id1","name":"name","version":1,"description":"","models":[],"view":{}}"""
    }

    def "should be delete project by DELETE request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildDelete()
                .invoke()

        then: "method remove of project repository was called"
        1 * repository.remove("id1") >> Optional.of(project);
        and: "Project was deleted"
        response.hasEntity()
        response.status == 200
        ProjectDto project = response.readEntity(ProjectDto.class);

        and: "server returned project from repository"
        project.id == "id1"
        project.name == "name"
        project.version == 1
    }

    def "should be return 404 code by DELETE request unavailable project"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/invalid")
                .request()
                .buildDelete()
                .invoke()

        then: "method get of project repository was called"
        1 * repository.remove("invalid") >> Optional.empty();
        and: "Project was not returned"
        response.status == 404
        String message = response.readEntity(String.class);
        message == "[{\"message\":\"Project 'invalid' is not founded\"}]"
    }

    def "should be save new project by POST request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 5, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildPost(Entity.json(project))
                .invoke()

        then: "method put of project repository was called"
        1 * repository.get('id1') >> Optional.empty()
        1 * repository.put(_ as Project) >> Optional.of(project)
        1 * repository.findByName('name') >> []
        and: "Project was saved"
        response.hasEntity()
        response.status == 201
        ProjectDto project = response.readEntity(ProjectDto.class)

        and: "server returned project from repository"
        project.id == "id1"
        project.name == "name"
        project.version == 1
    }

    def "should be save existen project by POST request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 5, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildPost(Entity.json(project))
                .invoke()

        then: "methods put and get of project repository was called"
        1 * repository.put(_ as Project) >> Optional.of(project)
        1 * repository.get('id1') >> Optional.of(project)
        1 * repository.findByName('name') >> [project]
        and: "Project was saved"
        response.hasEntity()
        response.status == 201
        ProjectDto project = response.readEntity(ProjectDto.class);

        and: "server returned project from repository"
        project.id == "id1"
        project.name == "name"
        project.version == 6
    }

    def "should be send error on bad POST request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project = new Project('id1', 'name', 5, "")
        project.setView("{}")
        project.setModels("[]")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildPost(Entity.json("{Invalid JSON}"))
                .invoke()

        then: "Project was not saved"
        0 * repository.put(_ as Project)
        response.hasEntity()
        response.status == 400
        String message = response.readEntity(String.class)

        and: "server returned eror message from repository"
        message.contains("Unexpected character ('I'")
    }

    def "should be send error on colision POST request"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project1 = new Project('id1', 'name', 5, "")
        project2 = new Project('id1', 'name', 3, "")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildPost(Entity.json(project1))
                .invoke()

        then: "methods  get of project repository was called"
        0 * repository.put(_ as Project)
        1 * repository.get('id1') >> Optional.of(project2)
        1 * repository.findByName('name') >> [project2]

        and: "Project was not saved"
        response.hasEntity()
        response.status == 409
        String message = response.readEntity(String.class)

        and: "server returned eror message from repository"
        message == "[{\"message\":\"Performance Model is not saved\"},{\"message\":\"Performance Model 'name' has already been changed by another user.\"}]"
    }

    def "should be send error on POST request with ununique name"() {

        setup:
        repository = Mock(Repository)
        sut.repository = repository
        project1 = new Project('id1', 'name', 5, "")
        project2 = new Project('id2', 'name', 6, "")

        when: "send GET request on project"
        Response response = server
                .newRequest("/project/id1")
                .request()
                .buildPost(Entity.json(project1))
                .invoke()

        then: "methods  get of project repository was called"
        0 * repository.put(_ as Project)
        1 * repository.findByName('name') >> [project2]

        and: "Project was not saved"
        response.hasEntity()
        response.status == 409
        String message = response.readEntity(String.class)

        and: "server returned eror message from repository"
        message == "[{\"message\":\"Performance Model is not saved\"},{\"message\":\"Performance Model 'name' already exists.\"}]"
    }

}
