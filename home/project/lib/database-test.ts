import { supabase } from './supabase';

export const runDatabaseTests = async () => {
  const results = {
    connectionTest: false,
    profilesTableTest: false,
    coursesTableTest: false,
    authTest: false,
    errors: [] as string[]
  };

  console.log('🔍 Starting database connection tests...');

  // Test 1: Basic connection
  try {
    console.log('Test 1: Basic connection test...');
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      results.errors.push(`Connection test failed: ${error.message}`);
      console.error('❌ Connection test failed:', error.message);
    } else {
      results.connectionTest = true;
      console.log('✅ Connection test passed');
    }
  } catch (error: any) {
    results.errors.push(`Connection test exception: ${error?.message || 'Unknown error'}`);
    console.error('❌ Connection test exception:', error?.message || 'Unknown error');
  }

  // Test 2: Profiles table access
  try {
    console.log('Test 2: Profiles table access...');
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      results.errors.push(`Profiles table test failed: ${error.message}`);
      console.error('❌ Profiles table test failed:', error.message);
    } else {
      results.profilesTableTest = true;
      console.log('✅ Profiles table test passed, found', data?.length || 0, 'profiles');
    }
  } catch (error: any) {
    results.errors.push(`Profiles table test exception: ${error?.message || 'Unknown error'}`);
    console.error('❌ Profiles table test exception:', error?.message || 'Unknown error');
  }

  // Test 3: Courses table access
  try {
    console.log('Test 3: Courses table access...');
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    if (error) {
      results.errors.push(`Courses table test failed: ${error.message}`);
      console.error('❌ Courses table test failed:', error.message);
    } else {
      results.coursesTableTest = true;
      console.log('✅ Courses table test passed, found', data?.length || 0, 'courses');
    }
  } catch (error: any) {
    results.errors.push(`Courses table test exception: ${error?.message || 'Unknown error'}`);
    console.error('❌ Courses table test exception:', error?.message || 'Unknown error');
  }

  // Test 4: Auth session check
  try {
    console.log('Test 4: Auth session check...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      results.errors.push(`Auth session test failed: ${error.message}`);
      console.error('❌ Auth session test failed:', error.message);
    } else {
      results.authTest = true;
      console.log('✅ Auth session test passed, session exists:', !!session);
    }
  } catch (error: any) {
    results.errors.push(`Auth session test exception: ${error?.message || 'Unknown error'}`);
    console.error('❌ Auth session test exception:', error?.message || 'Unknown error');
  }

  console.log('🏁 Database tests completed');
  console.log('📊 Results:', {
    connectionTest: results.connectionTest,
    profilesTableTest: results.profilesTableTest,
    coursesTableTest: results.coursesTableTest,
    authTest: results.authTest,
    totalErrors: results.errors.length
  });

  if (results.errors.length > 0) {
    console.log('❌ Errors found:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  return results;
};

export const testSpecificTable = async (tableName: string) => {
  try {
    console.log(`🔍 Testing table: ${tableName}`);
    const { data, error } = await (supabase as any).from(tableName).select('*').limit(1);
    
    if (error) {
      console.error(`❌ Table ${tableName} test failed:`, error.message);
      return { success: false, error: error.message, data: null };
    }
    
    console.log(`✅ Table ${tableName} test passed, found ${data?.length || 0} rows`);
    return { success: true, error: null, data };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error(`❌ Table ${tableName} test exception:`, errorMessage);
    return { success: false, error: errorMessage, data: null };
  }
};