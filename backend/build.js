#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lambda function entry points
const lambdaEntryPoints = {
  'auth/login': 'src/app/lambdas/auth/login.ts',
  'auth/register': 'src/app/lambdas/auth/register.ts',
  'bookings/create': 'src/app/lambdas/bookings/create.ts',
  'courts/create-court': 'src/app/lambdas/courts/create-court.ts',
  'courts/get-courts': 'src/app/lambdas/courts/get-courts.ts',
  'events/booking-processor': 'src/app/lambdas/events/booking-processor.ts',
  'users/get-profile': 'src/app/lambdas/users/get-profile.ts',
  'users/update-profile': 'src/app/lambdas/users/update-profile.ts',
};

// Build configuration
const buildConfig = {
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  external: [
    // AWS SDK v3 is available in Lambda runtime
    '@aws-sdk/*',
    'aws-sdk',
  ],
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  logLevel: 'info',
};

async function buildLambdas() {
  console.log('🚀 Building Lambda functions for production...');
  
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  const isWatch = process.argv.includes('--watch');
  
  try {
    // Build each Lambda function
    for (const [name, entryPoint] of Object.entries(lambdaEntryPoints)) {
      const outputDir = path.join('dist', name);
      fs.mkdirSync(outputDir, { recursive: true });
      
      console.log(`📦 Building ${name}...`);
      
      const config = {
        ...buildConfig,
        entryPoints: [entryPoint],
        outfile: path.join(outputDir, 'index.js'),
      };
      
      if (isWatch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        console.log(`👀 Watching ${name} for changes...`);
      } else {
        await esbuild.build(config);
        console.log(`✅ Built ${name}`);
      }
    }
    
    if (!isWatch) {
      // Generate build manifest
      const manifest = {
        buildTime: new Date().toISOString(),
        nodeVersion: process.version,
        lambdas: Object.keys(lambdaEntryPoints).map(name => ({
          name,
          path: `dist/${name}`,
          handler: 'index.handler',
        })),
      };
      
      fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
      console.log('📄 Generated build manifest');
      
      console.log('🎉 All Lambda functions built successfully!');
      console.log(`📊 Built ${Object.keys(lambdaEntryPoints).length} Lambda functions`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildLambdas().catch(console.error);
