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

import org.aopalliance.intercept.ConstructorInterceptor;
import org.aopalliance.intercept.MethodInterceptor;
import org.glassfish.hk2.api.Filter;
import org.glassfish.hk2.api.InterceptionService;
import org.glassfish.hk2.utilities.BuilderHelper;
import org.jvnet.hk2.annotations.Service;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>02.09.2015</pre>
 */
@Service
public class HK2InterceptionService implements InterceptionService {

    private static final MethodInterceptor METHOD_INTERCEPTOR = new BenchmarkMethodInterceptor();

    private static final List<MethodInterceptor> METHOD_LIST = Collections.singletonList(METHOD_INTERCEPTOR);

    public Filter getDescriptorFilter() {
        return BuilderHelper.allFilter();
    }

    @Override
    public List<ConstructorInterceptor> getConstructorInterceptors(Constructor<?> constructor) {
        return null;
    }

    @Override
    public List<MethodInterceptor> getMethodInterceptors(Method method) {
        if (method.isAnnotationPresent(Benchmark.class)) {
            return METHOD_LIST;
        }
        return null;
    }


}

