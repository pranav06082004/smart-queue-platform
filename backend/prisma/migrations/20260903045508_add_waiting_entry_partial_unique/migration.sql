CREATE UNIQUE INDEX "one_waiting_entry_per_user_per_queue"
ON "QueueEntry" ("queueId", "userId")
WHERE "status" = 'WAITING';