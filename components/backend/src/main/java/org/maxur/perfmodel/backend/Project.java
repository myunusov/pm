/*
 * Copyright (c) 2013 Maxim Yunusov
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

package org.maxur.perfmodel.backend;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

/**
 * @author Maxim Yunusov
 * @version 1.0 24.11.13
 */
@XmlRootElement
public class Project implements Serializable {

    private static final long serialVersionUID = -5236202133124299315L;

    private String raw;

    private String id;

    private String name;

    private int version;

    public Project() {
    }

    public Project(final String id, final String name, final int version) {
        this.id = id;
        this.name = name;
        this.version = version;
    }


    public void checkConflictWith(final Project previousProjectVersion) throws ValidationException {
        if (previousProjectVersion == null) {
            return;
        }
        if (!id.equals(previousProjectVersion.getId())) {
            throw new ValidationException(String.format("Performance Model '%s' already exists.", name));
        }
        if (version - 1 != previousProjectVersion.getVersion()) {
            throw new ValidationException(
                    String.format("Performance Model '%s' has already been changed by another user.", name)
            );
        }
    }

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }

    public int getVersion() {
        return version;
    }

    public void setRaw(String raw) {
        this.raw = raw;
    }

    public String asRaw() {
        return raw;
    }
}
