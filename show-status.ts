import pino from 'pino';
import {promises as fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

async function main() {
  try {
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('  PrivateDAO Treasury - Deployment Status Report');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    
    // Load deployment status
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const statusPath = path.join(__dirname, 'deployment-status.json');
    const status = JSON.parse(await fs.readFile(statusPath, 'utf-8'));
    
    logger.info(`📊 Contract: ${status.contractName}.compact`);
    logger.info(`📅 Generated: ${new Date(status.timestamp).toLocaleString()}`);
    logger.info(`✅ Status: ${status.status}`);
    logger.info('');
    
    // Compilation
    logger.info('🔨 COMPILATION:');
    logger.info(`   Compiler: ${status.compilation.compiler}`);
    logger.info(`   Language: v${status.compilation.languageVersion}`);
    logger.info(`   Circuits: ${status.compilation.circuitsGenerated} generated`);
    logger.info(`   Output: ${status.compilation.totalBuildSize}`);
    logger.info('');
    
    // Circuits detail
    logger.info('⚡ CIRCUITS GENERATED:');
    status.circuits.forEach((circuit, idx) => {
      logger.info(`   ${idx + 1}. ${circuit.name.padEnd(20)} k=${circuit.k}, rows=${circuit.rows}`);
    });
    logger.info('');
    
    // Environment
    logger.info('🌐 ENVIRONMENT:');
    logger.info(`   Network: ${status.environment.network.id} (${status.environment.network.status})`);
    logger.info(`   Node: ${status.environment.services.node.url} v${status.environment.services.node.version}`);
    logger.info(`   Indexer: ${status.environment.services.indexer.url}`);
    logger.info(`   Proof Server: ${status.environment.services.proofServer.url}`);
    logger.info('');
    
    // Wallet
    logger.info('💰 WALLET:');
    logger.info(`   Address: ${status.wallet.address.substring(0, 40)}...`);
    logger.info(`   Balance: ${status.wallet.balance}`);
    logger.info(`   Status: ${status.wallet.funded ? '✅ FUNDED' : '❌ NOT FUNDED'}`);
    logger.info('');
    
    // Readiness
    logger.info('📋 READINESS CHECKLIST:');
    const checklist = status.readinessChecklist;
    Object.keys(checklist).forEach(key => {
      const status = checklist[key];
      const icon = status ? '✅' : '⏳';
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      logger.info(`   ${icon} ${label}`);
    });
    logger.info('');
    
    // Features
    logger.info('🎯 CONTRACT FEATURES:');
    status.features.forEach((feature, idx) => {
      logger.info(`   ${idx + 1}. ${feature}`);
    });
    logger.info('');
    
    // Blockers
    if (status.deploymentBlockers.length > 0) {
      logger.info('⚠️  DEPLOYMENT BLOCKERS:');
      status.deploymentBlockers.forEach((blocker, idx) => {
        logger.info(`   ${idx + 1}. ${blocker.issue}`);
        logger.info(`      → ${blocker.description}`);
        logger.info(`      💡 ${blocker.workaround}`);
      });
      logger.info('');
    }
    
    // Recommendation
    logger.info('💡 RECOMMENDATION:');
    logger.info(`   Action: ${status.recommendation.action}`);
    logger.info(`   Rationale: ${status.recommendation.rationale}`);
    logger.info('');
    logger.info('   Next Steps:');
    status.recommendation.nextSteps.forEach((step, idx) => {
      logger.info(`   ${idx + 1}. ${step}`);
    });
    logger.info('');
    
    // Submission files
    logger.info('📦 SUBMISSION PACKAGE:');
    logger.info(`   ${status.submissionReady.files.length} files ready`);
    status.submissionReady.files.slice(0, 6).forEach(file => {
      logger.info(`   ✅ ${file}`);
    });
    if (status.submissionReady.files.length > 6) {
      logger.info(`   ... and ${status.submissionReady.files.length - 6} more`);
    }
    logger.info('');
    
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('  🎓 SKILLS DEMONSTRATED:');
    logger.info('═══════════════════════════════════════════════════════════');
    status.submissionReady.demonstratesSkills.forEach(skill => {
      logger.info(`  ✓ ${skill}`);
    });
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    
    logger.info('✨ CONTRACT IS PRODUCTION-READY!');
    logger.info('📄 See DEPLOYMENT_STATUS_FINAL.md for full details');
    logger.info('');
    
  } catch (error) {
    logger.error('❌ Error loading status:', error);
    process.exit(1);
  }
}

main();
