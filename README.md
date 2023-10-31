# mdi-solid
[Material Design Icons](https://materialdesignicons.com) for SolidJS packaged as single components supporting SSR & Browser

It's developed for [SolidJS Anique](https://www.npmjs.com/package/@qinetik/anique)

But you can use it without anique as well

## Installation

```bash
npm install @qinetik/mdi
# or if you use Yarn
yarn add @qinetik/mdi
```

## Usage

Just search for an icon on [materialdesignicons.com](https://materialdesignicons.com) and look for its name.  
The name translates to PascalCase followed by the suffix `Icon` in `@qinetik/mdi`.  
Also it's possible to import with an alias. You can find them on the detail page of the respective icon.

For example the icons named `alert` and `alert-circle`:

```typescript jsx
import AlertIcon from '@qinetik/mdi/AlertIcon';
import AlertCircleIcon from '@qinetik/mdi/AlertCircleIcon';

const MyComponent = () => {
  return (
    <div>
      {/* The default color is the current text color (currentColor) */}
      <AlertIcon color="#fff" />
      {/* The default size is 24 */}
      <AlertCircleIcon class="some-class" size={16} />
      {/* This sets the icon size to the current font size */}
      <AlertIcon size="1em" />
    </div>
  );
};
```