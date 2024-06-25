# stdhub-plugin-api

Server-side API for bedrock-stdhub developers.

# Usage

Construct an instance of `StdhubPluginApi`:
```typescript
import { StdhubPluginApi } from 'stdhub-plugin-api';

// Constructing an instance needs a namespace.
// Generally, it is recommended that you directly use your plugin name as the namespace.
const pluginName = 'my-awesome-plugin';
const api = new StdhubPluginApi(pluginName);
```
and start coding.

The documentation of each method is embedded with code, so rely on IDEs to see them.