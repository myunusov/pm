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
import org.maxur.perfmodel.backend.domain.Project
import org.maxur.perfmodel.backend.domain.ProjectRepository
import org.maxur.perfmodel.backend.rest.dto.ProjectDto
import org.maxur.perfmodel.backend.rest.resources.ProjectResource
import spock.lang.Shared

import javax.ws.rs.client.Entity
import javax.ws.rs.core.GenericType
import javax.ws.rs.core.Response

import static java.util.Optional.empty
/**
 * @author myunusov
 * @version 1.0
 * @since <pre>29.08.2015</pre>
 */
class ProjectResourceSpec extends AbstractRestSpec {

    @Shared
    InstanceFactory<ProjectRepository> provider  = provider()

    @Override
    Class[] resources() {
        return [ProjectResource]
    }

    @Override
    AbstractBinder testBinder() {
        return new AbstractBinder() {
            @Override
            protected void configure() {
                bindFactory(provider).to(ProjectRepository);
            }
        }
    }

    def "should be return projects by GET request"() {

        setup:
        def project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")
        provider.set(Mock(ProjectRepository) {
            1 * findAll() >> [project];
        })
        when: "send GET request on project"
        Response response = target("/project")
                .request()
                .buildGet()
                .invoke();

        then: "Project List was returned"
        response.hasEntity()
        List<ProjectDto> projects = response.readEntity(new GenericType<List<ProjectDto>>() {});
        and: "server returned project from repository"
        projects.size() == 1
        projects.get(0).id == "id1"
        projects.get(0).name == "name"
        projects.get(0).version == 1
        projects.get(0).view == "{}"
        projects.get(0).models == "[]"
    }

    def "should be return 404 code by GET request unavailable project"() {

        setup:
        provider.set(Mock(ProjectRepository) {
            1 * get("invalid") >> empty();
        })

        when: "send GET request on project"
        Response response = target("/project/invalid")
                .request()
                .buildGet()
                .invoke();

        then: "Returns error 404 "
        response.status == 404
        String rawProject = response.readEntity(String);
        rawProject == "[{\"message\":\"Project 'invalid' is not founded\"}]"
    }


    def "should be return project by GET request"() {

        setup:
        def project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")

        provider.set(Mock(ProjectRepository) {
            1 * get("id1") >> Optional.of(project);
        })

        when: "send GET request on project"
        Response response = target("/project/id1")
                .request()
                .buildGet()
                .invoke()

        then: "Project was returned"
        response.hasEntity()
        response.status == 200
        String rawProject = response.readEntity(String);
        rawProject == """{"id":"id1","name":"name","version":1,"description":"","models":[],"view":{}}"""
    }

    def "should be delete project by DELETE request"() {

        setup:
        def project = new Project('id1', 'name', 1, "")
        project.setView("{}")
        project.setModels("[]")
        provider.set(Mock(ProjectRepository) {
            1 * remove("id1") >> Optional.of(project);
        })

        when: "send GET request on project"
        Response response = target("/project/id1")
                .request()
                .buildDelete()
                .invoke()

        then: "Project was deleted"
        response.hasEntity()
        response.status == 200
        ProjectDto dto = response.readEntity(ProjectDto);

        and: "server returns deleted project from repository"
        dto.id == "id1"
        dto.name == "name"
        dto.version == 1
    }

    def "should be return 404 code by DELETE request unavailable project"() {

        setup:
        provider.set(Mock(ProjectRepository) {
            1 * remove("invalid") >> empty();
        })

        when: "send GET request on project"
        Response response = target("/project/invalid")
                .request()
                .buildDelete()
                .invoke()

        then: "Project is not deleted"
        response.status == 404
        String message = response.readEntity(String);
        message == "[{\"message\":\"Project 'invalid' is not founded\"}]"
    }

    def "should be save new project by POST request"() {

        setup:
        def project = new Project('id1', 'name', 5, "")
        project.setView("{}")
        project.setModels("[]")
        provider.set(Mock(ProjectRepository) {
            1 * put(_ as Project) >> Optional.of(project)
        })

        when: "send GET request on project"
        Response response = target("/project/id1")
                .request()
                .buildPost(Entity.json(project))
                .invoke()

        then: "Project was saved"
        response.hasEntity()
        response.status == 201
        ProjectDto dto = response.readEntity(ProjectDto)

        and: "server returned project from repository"
        dto.id == "id1"
        dto.name == "name"
        dto.version == 5
    }


    def "should be send error on bad POST request"() {

        setup:
        def project = new Project('id1', 'name', 5, "")
        project.setView("{}")
        project.setModels("[]")
        provider.set(Mock(ProjectRepository) {
            0 * put(_ as Project)
        })

        when: "send GET request on project"
        Response response = target("/project/id1")
                .request()
                .buildPost(Entity.json("{Invalid JSON}"))
                .invoke()

        then: "Project was not saved"
        response.hasEntity()
        response.status == 400
        String message = response.readEntity(String)

        and: "server returned eror message from repository"
        message.contains("Unexpected character ('I'")
    }


}