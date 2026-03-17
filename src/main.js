const schema = {
  tables: [
    {
      name: 'merchants',
      columns: [
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'store_name', type: 'text' },
      ]
    },
    {
      name: 'transactions',
      columns: [
        { name: 'merchant_id', type: 'text' },
        { name: 'amount', type: 'real' },
        { name: 'currency', type: 'text' },
        { name: 'customer_ref', type: 'text' },
        { name: 'payment_method', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'created_at', type: 'text' },
      ]
    },
    {
      name: 'pending_transactions',
      columns: [
        { name: 'merchant_id', type: 'text' },
        { name: 'amount', type: 'real' },
        { name: 'currency', type: 'text' },
        { name: 'customer_ref', type: 'text' },
        { name: 'payment_method', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'synced', type: 'integer' },
        { name: 'created_at', type: 'text' },
      ]
    }
  ]
};

const db = new PowerSyncDatabase({
  schema,
  database: { dbFilename: 'payduka.db' }
});

async function connectPowerSync() {
  await db.connect({
    fetchCredentials: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return {
        endpoint: POWERSYNC_URL,
        token: session?.access_token ?? 'dev-token',
      };
    },
    uploadData: async (database) => {
      const txCrud = await database.getCrudBatch();
      if (!txCrud) return;
      for (const op of txCrud.crud) {
        if (op.op === 'PUT' || op.op === 'INSERT') {
          await supabase.from(op.table).upsert(op.opData);
        }
      }
      await txCrud.complete();
    }
  });
}

connectPowerSync().catch(console.error);

export { db, supabase };