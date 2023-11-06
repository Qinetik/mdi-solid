const fs = require('fs');
const { sync: mkdirp } = require('mkdirp');
const path = require('path');
const meta = require('@mdi/svg/meta.json');

const svgPathRegex = /\sd="(.*)"/;
const startsWithNumberRegex = /^\d/;

function normalizeName(name) {
  return name.split(/[ -]/g).map(part => {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('') + 'Icon';
}

function collectComponents(svgFilesPath) {
  const svgFiles = fs.readdirSync(svgFilesPath);

  const icons = [];
  for (const svgFile of svgFiles) {
    const origName = svgFile.slice(0, -4);
    const name = normalizeName(origName);

    const content = fs.readFileSync(path.join(svgFilesPath, svgFile));
    const svgPathMatches = svgPathRegex.exec(content);
    const svgPath = svgPathMatches && svgPathMatches[1];
    // skip on empty svgPath
    if (!svgPath) throw new Error('Empty SVG path');

    const icon = {
      name: name,
      aliases: [],
      fileName: name + '.svg',
      svgPath
    };

    const iconMeta = meta.find(entry => entry.name === origName);
    if (iconMeta) {
      icon.aliases = iconMeta.aliases;
    }

    icons.push(icon);
  }

  const aliases = [];
  const removeAliases = [];
  for (const icon of icons) {
    for (const alias of icon.aliases) {
      const normalizedAlias = normalizeName(alias);

      // if the alias starts with a number, ignore it since JavaScript
      // doesn't support variable names starting with a number
      if (startsWithNumberRegex.test(normalizedAlias)) {
        continue;
      }

      // check if alias duplicates top-level icon name and ignore
      if (icons.find(icon => icon.name.toLowerCase() === normalizedAlias.toLowerCase())) {
        continue;
      }

      // check if alias itself is duplicated
      const duplicateAlias = aliases.find(alias2 => alias2.name.toLowerCase() === normalizedAlias.toLowerCase());
      if (duplicateAlias) {
        // check if duplicate alias is on same icon
        // if not note for removal from final list
        if (duplicateAlias.aliasFor !== icon.name) {
          console.warn(`Duplicate alias ${normalizedAlias} (${icon.name}, ${duplicateAlias.aliasFor})`);
          removeAliases.push(duplicateAlias.name);
          continue;
        }

        continue;
      }

      aliases.push({
        name: normalizedAlias,
        aliasFor: icon.name,
        fileName: normalizedAlias + '.svg',
        svgPath: icon.svgPath
      });
    }

    // removed no longer required aliases array
    delete icon.aliases;
  }

  // clean up remaining alias duplicates
  for (const aliasName of removeAliases) {
    const index = aliases.find(alias => aliasName === alias);
    aliases.splice(index, 1);
  }

  return [...icons, ...aliases];
}

async function generate(publicDir, jsCb, distFolder) {
  const basePath = path.resolve(__dirname, '..');
  const svgFilesPath = path.resolve(basePath, 'node_modules/@mdi/svg/svg');
  const publishPath = path.resolve(basePath, publicDir);
  mkdirp(publishPath);
  const distPath = path.resolve(publishPath, distFolder != null ? distFolder :  'dist');
  mkdirp(distPath);

  console.log('Collecting components...');
  const components = collectComponents(svgFilesPath);

  console.log('Generating components...');
  for (const [index, component] of components.entries()) {
    if (!component.aliasFor) {
      console.log(`Generating ${component.name}... (${index + 1}/${components.length})`);
    } else {
      console.log(`Generating alias ${component.name}... (${index + 1}/${components.length})`);
    }

    const fileContent = jsCb(component);
    const outputPath = path.resolve(distPath, component.fileName);

    fs.writeFileSync(outputPath, fileContent);

  }
}

generate("publish-svg", (component) => (
`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${component.svgPath}" /></svg>`
), "")