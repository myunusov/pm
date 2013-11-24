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

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class MemoryDataSource implements DataSource {

    private static final  Map<String, Project> MAP = new ConcurrentHashMap<>();

    @Override
    public Project get(final String key) {
        return MAP.get(key);
    }

    @Override
    public Project remove(final String key) {
        return MAP.remove(key);
    }

    @Override
    public Project put(final Project project) {
        return MAP.put(project.getName(), project);
    }

    @Override
    public Collection<Project> findAll() {
        return MAP.values();
    }
}