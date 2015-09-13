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

package org.maxur.perfmodel.backend.rest.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;
import org.jsondoc.core.annotation.ApiObject;
import org.jsondoc.core.annotation.ApiObjectField;
import org.maxur.perfmodel.backend.domain.Project;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;

/**
 * @author Maxim Yunusov
 * @version 1.0 24.11.13
 */
@SuppressWarnings("unused")
@XmlRootElement
@ApiObject(name = "Project")
public class ProjectDto implements Serializable {

    private static final long serialVersionUID = -5236202133124299315L;

    @ApiObjectField(required = true, description = "The project identifier")
    private String id;

    @ApiObjectField(required = true, description = "The project name")
    private String name;

    @ApiObjectField(required = true, description = "The project version")
    private int version;

    @ApiObjectField(required = false, description = "The project description")
    private String description;

    @ApiObjectField(required = false, description = "The Serialized presentation of the object's models", format="[]")
    @JsonRawValue
    private String models;

    @ApiObjectField(required = false, description = "The Serialized presentation of the object's view", format="{}")
    @JsonRawValue
    private String view;

    @SuppressWarnings("UnusedDeclaration")
    public ProjectDto() {
    }

    public ProjectDto(final String id, final String name, final int version, final String description) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.description = description;
    }

    public String getId() {
        return id;
    }


    public String getName() {
        return name;
    }

    public int getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public String getModels() {
        return models;
    }

    public String getView() {
        return view;
    }

    public void setModels(final JsonNode models) {
        this.models = models == null ? null : models.toString();
    }

    public void setView(final JsonNode view) {
        this.view = view == null ? null : view.toString();
    }

    /**
     * Creation method. Create DTO List by Project List.
     * <p/>
     * @param all list of Projects.
     * @return project's dto List.
     */
    public static List<ProjectDto> dtoList(final Collection<Project> all) {
        return all.stream().map(ProjectDto::dto).collect(toList());
    }

    /**
     * Creation method. Create Full DTO by Project.
     * <p/>
     * @param project domain object 'Project'.
     * @return project's dto.
     */
    public static ProjectDto dto(final Project project) {
        final ProjectDto dto =
                new ProjectDto(project.getId(), project.getName(), project.getVersion(), project.getDescription());
        dto.models = project.getModels();
        dto.view = project.getView();
        return dto;
    }

    /**
     * Create entity object 'Project' from this dto.
     *
     * @return The Project.
     */
    public Project assemble() {
        final Project result = new Project(id, name, version, description);
        result.setModels(models);
        result.setView(view);
        return result;
    }
}
