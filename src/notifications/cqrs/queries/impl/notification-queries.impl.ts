export class FindAllNotificationsQuery {}

export class FindNotificationsByUserQuery {
  constructor(public readonly userId: string) {}
}

export class FindUnreadNotificationsByUserQuery {
  constructor(public readonly userId: string) {}
}

export class FindNotificationByIdQuery {
  constructor(public readonly id: string) {}
}
