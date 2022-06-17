<template>
  <div :key="forceRerender" id="permissionsPage" class="pa-5">
    <v-row
      v-if="
        rolePermissions.length > 0 && permissions.length > 0 && roles.length > 0
      "
    >
      <v-divider vertical></v-divider>
      <template
        v-for="role in roles.filter(
          (role) =>
            role.idRole == 1 ||
            role.idRole == 2 ||
            role.idRole == 6 ||
            role.idRole == 7
        )"
      >
        <v-col :key="role.idRole">
          <v-card elevation="0" class="pa-0">
            <v-alert type="info">{{ role.roleName }}</v-alert>
            <template v-for="group in permissionGroup">
              <v-alert type="success" :key="group.groupName">{{
                group.groupName
              }}</v-alert>
              <v-checkbox
                :value="getPermissions(role.idRole, permission.idPermission)"
                :input-value="
                  getPermissions(role.idRole, permission.idPermission)
                "
                v-for="permission in permissions.filter((e) =>
                  group.permissions.includes(e.idPermission)
                )"
                :key="permission.idPermission"
                :label="permission.permissionName"
                @change="
                  changePerm(role.idRole, permission.idPermission, $event)
                "
              ></v-checkbox>
            </template>
          </v-card>
        </v-col>
        <v-divider :key="'ROLE_' + role.idRole" vertical></v-divider>
      </template>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "PermissionsPage",
  data: () => ({
    roles: [],
    permissions: [],
    rolePermissions: [],
    forceRerender: 0,
    permissionGroup: [
      { groupName: "صلاحيات الفواتير", permissions: [1, 2, 3, 4] },
      { groupName: "صلاحيات الزبائن", permissions: [5, 6, 11, 13, 35] },
      { groupName: "صلاحيات البرنامج", permissions: [12, 15, 22, 23, 32, 33] },
      {
        groupName: "صلاحيات المواد",
        permissions: [7, 8, 9, 10, 16, 17, 18, 19, 29],
      },
      { groupName: "صلاحيات الموقع", permissions: [20, 21, 30] },
      {
        groupName: "صلاحيات الكشوفات",
        permissions: [24, 25, 26, 27, 28, 31, 34, 36],
      },
    ],
  }),
  mounted: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "users/roles/all")
        .then((res) => {
          this.roles = res.data;
          this.forceRerender++;
        })
        .finally(() => loading.hide());
      this.$http.get(this.$baseUrl + "permissions").then((res) => {
        this.permissions = res.data;
        this.forceRerender++;
      });
      this.$http.get(this.$baseUrl + "permissions/role").then((res) => {
        this.rolePermissions = res.data;
        console.log(this.rolePermissions);
        this.forceRerender++;
      });
    },

    getPermissions(roleId, permissionId) {
      let perms = this.rolePermissions.filter(
        (perm) => perm.roleId == roleId && perm.permissionId == permissionId
      );

      console.log(perms);
      if (perms.length > 0) {
        return true;
      } else {
        return false;
      }
    },

    changePerm(roleId, permissionId, e) {
      this.$http.post(this.$baseUrl + "permissions", {
        roleId: roleId,
        permissionId: permissionId,
        value: e,
      });
    },
  },
};
</script>

<style>
.v-input--checkbox label {
  font-size: 12px;
}
</style>