interface SmartLockAPI {
  "/v1.0/token?grant_type=1": {
    GET: {
      request: {};
      response: {
        result: {
          access_token: string;
          expire_time: number;
          refresh_token: string;
          uid: string;
        };
        success: boolean;
        t: number;
        tid: string;
      };
    };
  };
  "/v2.0/devices/{device_id}/door-lock/temp-password": {
    POST: {
      request: {
        /**
         * The length of the original password is seven for Wi-Fi locks and six for Zigbee locks
         * and Bluetooth locks. The password is encrypted by using the AES-128 algorithm with ECB
         *  mode and PKCS7Padding. To get the original key, decrypt the temporary key ticket_key
         *  with AES using the accessKey that is issued by the platform. (Required)
         */
        password: string;
        /**
         * The 10-digit timestamp of the effective time. Unit: seconds (s).(Required)
         */
        effective_time: number;
        /**
         * The 10-digit timestamp of the expiration time. Unit: seconds (s).(Required)
         */
        invalid_time: number;
        /**
         * The password is encrypted using a ticket.(Required)
         */
        password_type: "ticket";
        /**
         * The ID of a specified temporary key.(Required)
         */
        ticket_id: string;
        /**
         * The mobile phone number. (Optional)
         */
        phone: string;
        /**
         * Indicates the number of times a password can be used. Valid values:
         *  1: A password can only be used once before it expires.
         *  0: A password can be used as many times as needed before it expires.
         * This field is required for Zigbee locks.
         */
        type?: number;
        /**
         * The time zone. This field is required if you use the periodic password feature. (Optional)
         */
        time_zone: string;
        /**
         * The parameter list of the periodic password feature. (Optional). Type List.
         */
        schedule_list: {
          /**
           * The time when a password becomes effective on that day, in minutes. (Required)
           */
          effective_time: number;
          /**
           * The time when a password expires on that day, in minutes. (Required)
           */
          invalid_time: number;
          /**
           * The day of the week. Each value accumulates.
           * Valid values:
           *  1: Sunday
           *  2: Monday
           *  4: Tuesday
           *  8: Wednesday
           * 16: Thursday
           * 32: Friday
           * 64: Saturday
           * (Required)
           */
          working_day: number;
        }[];
      };
      response: {
        /**
         * Indicates whether the operation is successful.
         * Valid values:
         *  true: succeeded.
         *  false: failed.
         */
        success: boolean;
        /**
         * The response time
         */
        t: number;
        /**
         * The error message that is returned if the API call fails.
         * This parameter value is empty if the API call succeeds.
         */
        msg: string;
        /**
         * The information about a temporary password.
         */
        result: {
          /**
           * The ID of a specified temporary password.
           */
          id: number;
        };
      };
    };
  };
  "/v1.0/devices/{device_id}/door-lock/password-ticket": {
    POST: {
      request: {};
      response: {
        /**
         * Indicates whether the operation is successful.
         * Valid values:
         *  true: succeeded.
         *  false: failed.
         */
        success: boolean;
        /**
         * The response time
         */
        t: number;
        /**
         * The error message that is returned if the API call fails.
         * This parameter value is empty if the API call succeeds.
         */
        msg: string;
        /**
         * The information about a temporary password.
         */
        result: {
          /**
           * The ID of a specified temporary key.
           */
          ticket_id: string;
          /**
           * The temporary key. It can be used after decryption with AES using the accessKey that
           *  is issued by the platform.
           */
          ticket_key: string;
          /**
           * The remaining validity period.
           */
          expire_time: number;
        };
      };
    };
  };
}
