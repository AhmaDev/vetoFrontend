<template>
  <div :key="forceRerender" id="permissionsPage" class="pa-10">
    <v-row v-if="rolePermissions.length > 0 && permissions.length > 0 && roles.length > 0">
      <v-col
        v-for="role in roles.filter((role) => role.idRole < 3)"
        :key="role.idRole"
      >
        <v-card no-elevation class="pa-10">
          <h4>{{ role.roleName }}</h4>
          <v-checkbox
            :value="getPermissions(role.idRole, permission.idPermission)"
            :input-value="getPermissions(role.idRole, permission.idPermission)"
            v-for="permission in permissions"
            :key="permission.idPermission"
            :label="permission.permissionName"
            @change="changePerm(role.idRole, permission.idPermission, $event)"
          ></v-checkbox>
        </v-card>
      </v-col>
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
    forceRerender: 0
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
</style>