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

package org.maxur.perfmodel.backend.service;

import org.iq80.leveldb.WriteBatch;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collection;
import java.util.Optional;

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>10.09.2015</pre>
 */
public interface DataSource {

    void init();

    void stop();

    <T> Optional<T> get(String key) throws IOException, ClassNotFoundException;

    <T> Collection<T> findAllByPrefix(String prefix) throws IOException, ClassNotFoundException;

    void delete(String key);

    WriteBatch createWriteBatch();

    void commit(WriteBatch batch);

    void put(String key, Serializable value) throws IOException;
}