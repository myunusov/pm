Release Steps

#### 1. Create Release on gitHub (or Milestone ?)

#### 2. Change download path in \PM\components\src\site\site.xml
 
 ```
<item name="Download" href="https://github.com/myunusov/pm/releases/download/v.1.3/assemblies-1.3.zip" />
 ```
 
#### 3. Check Prject, Prepare POM's, make tag etc 

```
mvn release:prepare -PPROD,nexus,zip
```
    
#### 4. Deploy artifact on nexus and site on github

```
mvn release:deploy -PPROD,nexus,zip
```
